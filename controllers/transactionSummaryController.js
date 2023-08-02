const TransactionSummaryService = require("../services/transactionSummaryService");
const apiResponse = require("../helper/apiResponse");
const commonUtils = require("../utils/commonUtils");

class TransactionSummary {
  constructor() {}

  findTransactionSummary = async (req, res, next) => {
    try {
      let transactionSummaryMatch = {},
        employeeMatch = {};
      if (!req.params.type) throw new Error("type is Required");
      if (req.params.type.toLowerCase() == "employee") {
        if (!req.query.userUUID) throw new Error("userUUID is Required");
        transactionSummaryMatch = { ...{ employeeUUID: req.query.userUUID } };
      } else if (req.params.type.toLowerCase() == "manager") {
        if (!req.query.userUUID) throw new Error("userUUID is Required");
        employeeMatch = { ...{ managerUUID: req.query.userUUID } };
      } else if (req.params.type.toLowerCase() == "admin") {
      } else {
        throw new Error("Invalid type");
      }
      if (req.body.transactionType != null) {
        transactionSummaryMatch.requestType = { $in: req.body.transactionType };
      }
      if (req.body.transactionStatus != null) {
        transactionSummaryMatch.status = { $in: req.body.transactionStatus };
      }
      if (req.body.startDate != null || req.body.endDate != null) {
        const startDate=req.body.startDate!=null?new Date(req.body.startDate):new Date("01/01/1900")
        const endDate=req.body.endDate!=null?new Date(req.body.endDate):new Date()
        endDate.setDate(endDate.getDate()+1)
        commonUtils.removeTimeFromDate(startDate)
        commonUtils.removeTimeFromDate(endDate)

        transactionSummaryMatch.createdAt={
          $gte: startDate,
          $lte: endDate,
        }
      }
      if (req.body.employeeId != null) {
        employeeMatch = {...employeeMatch,...{'id': { '$regex' : req.body.employeeId, '$options' : 'i' }}};
      }
      if (req.body.employeeName != null) {
        employeeMatch = {...employeeMatch,...{$or:[ {'firstName': { '$regex' : req.body.employeeName, '$options' : 'i' }},{'middleName': { '$regex' : req.body.employeeName, '$options' : 'i' }},{'lastName': { '$regex' : req.body.employeeName, '$options' : 'i' }}]} };
      }
      let pipeline = [
        {
          $match: {
            isActive: true,
            ...transactionSummaryMatch,
          },
        },
        {
          $lookup: {
            from: "resignationApprovalHistory",
            localField: "requestUUID",
            foreignField: "resignationUUID",
            pipeline: [
              {
                $group: {
                  _id: "$levelOfApprover",
                  approver: { $first: "$approver" },
                  status: { $push: "$approvalStatus" },
                },
              },
            ],
            as: "resignationHistoryData",
          },
        },
        {
          $lookup: {
            from: "employee",
            localField: "employeeUUID",
            foreignField: "uuid",
            pipeline: [
              {
                $match: {
                  ...employeeMatch,
                },
              },
            ],
            as: "employeeData",
          },
        },
        {
          $unwind: {
            path: "$employeeData",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            _id:0,
            resignationUUID: "$requestUUID",
            employeeUUID: 1,
            employeeId: "$employeeData.id",
            employeeName: {
              $concat: [
                "$employeeData.firstName",
                " ",
                "$employeeData.lastName",
              ],
            },
            resignationHistoryData: "$resignationHistoryData",
            requestType: 1,
            requestedDate: 1,
            status: 1,
          },
        },
      ];
      console.log(JSON.stringify(pipeline));
      let result =
        await TransactionSummaryService.findTransactionSummaryByAggregation(
          pipeline,
          req
        );

      if (result.length == 0) {
        return res
          .status(404)
          .send("TransactionSummary not found in the database");
      }
      result.forEach((transactionData) => {
        transactionData.resignationHistoryData.forEach((historyData) => {
          const levelStatus = historyData.status.find(
            (status) => status != null
          );
          historyData.approvalStatus =
            levelStatus != null ? levelStatus : "Pending";
        });
        const approveOrRejectedList =
          transactionData.resignationHistoryData.filter(
            (historyData) => historyData.approvalStatus == transactionData.status
          );
        let statusWith = "";
        approveOrRejectedList.forEach((history) => {
          statusWith += (statusWith.length == 0 ? "" : ",") + history.approver;
        });
        transactionData.statusWith = statusWith;
        delete transactionData.resignationHistoryData;
      });
      
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log(
        "Find TransactionSummary, Data By: " + JSON.stringify(req.params)
      );
      // call method to service

      let result = await TransactionSummaryService.findTransactionSummary(
        {},
        req
      );
      if (!result) {
        return res
          .status(404)
          .send("TransactionSummary not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createTransactionSummary = async (req, res, next) => {
    try {
      console.log(
        "Create TransactionSummary, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await TransactionSummaryService.createTransactionSummary(
        data,
        req
      );

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  updateTransactionSummary = async (req, res, next) => {
    try {
      console.log(
        "Update TransactionSummary, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await TransactionSummaryService.updateTransactionSummary(
        data,
        req
      );

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  deleteTransactionSummary = async (req, res) => {
    try {
      console.log(
        "Delete TransactionSummary, Data : " + JSON.stringify(req.query)
      );

      const data = req.query;
      if (!data.uuid)
        return apiResponse.notFoundResponse(
          res,
          "Please send TransactionSummary UUID"
        );

      let query = {
        uuid: data.uuid,
      };

      // call method to service
      let response = await TransactionSummaryService.delete(query, req);

      if (response?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No TransactionSummary found for the UUId provided:${data.uuid}`
        );
      }
      return apiResponse.successResponse(
        res,
        "Successfully deleted TransactionSummary"
      );
    } catch (error) {
      console.log(error);
      apiResponse.errorResponse(res, error.message);
    }
  };
}

module.exports = new TransactionSummary();
