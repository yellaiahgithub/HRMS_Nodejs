const StorageService = require("../services/StorageService");
const resignationApprovalHistoryService = require("../services/resignationApprovalHistoryService");
const ResignationService = require("../services/resignationService");

class Resignation {
  constructor() {}

  //findbyuuid api and findAll api
  find = async (req, res, next) => {
    try {
      let result;
      let query = {};
      if (req.query.uuid) {
        query = { uuid: req.query.uuid };
      }
      result = await ResignationService.findResignation(query, req);
      if (result?.length == 0) {
        return res.status(404).send("Resignation not found in the database");
      }
      if (req.query.uuid) {
        return res.status(200).send(result[0]);
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findResignationByApproverUUID = async (req, res, next) => {
    try {
      let match = {};
      if (!req.query.isDirectEmployee)
        throw new Error("Please send 'Is Direct Employee' in query param");
      const isDirectEmployee =
        req.query.isDirectEmployee.toLowerCase() === "true"
          ? true
          : req.query.isDirectEmployee.toLowerCase() === "false"
          ? false
          : null;
      if (isDirectEmployee == null) throw new Error("Invalid isDirectEmployee");
      if (req.query.isL2L3Approver) {
        const isL2L3Approver =
          req.query.isL2L3Approver.toLowerCase() === "true"
            ? true
            : req.query.isL2L3Approver.toLowerCase() === "false"
            ? false
            : null;
        if (isL2L3Approver == null) throw new Error("Invalid isL2L3Approver");
        else if (isL2L3Approver) {
          match = { ...match, ...{ approver: { $nin: ["Admin", "Role"] } } };
        }
      }
      if (req.query.fetchBy) {
        const fetchByValue =
          req.query.fetchBy.toLowerCase() === "Admin".toLowerCase()
            ? "Admin"
            : req.query.fetchBy.toLowerCase() === "Role".toLowerCase()
            ? "Role"
            : null;
        if (fetchByValue == null) throw new Error("Invalid fetchByRole");
          match = { ...match, ...{ approver: { $eq: fetchByValue } } };
      }
      let pipeline = [
        {
          $lookup: {
            from: "resignationApprovalHistory",
            localField: "uuid",
            foreignField: "resignationUUID",
            pipeline: [
              {
                $match: {
                  approverUUID: req.params.approverUUID,
                  isActive: true,
                  isDirectEmployee: isDirectEmployee,
                  ...match,
                },
              },
            ],
            as: "resignationHistoryData",
          },
        },
        {
          $unwind: {
            path: "$resignationHistoryData",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "employee",
            localField: "employeeUUID",
            foreignField: "uuid",
            pipeline: [
              {
                $lookup: {
                  from: "designation",
                  localField: "designation",
                  foreignField: "id",
                  as: "designationData",
                },
              },
              {
                $unwind: {
                  path: "$designationData",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: "employeeData",
          },
        },
        {
          $unwind: {
            path: "$employeeData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            resignationUUID: "$uuid",
            employeeUUID: 1,
            file: "$employeeData.file",
            employeeName: {
              $concat: [
                "$employeeData.firstName",
                " ",
                "$employeeData.lastName",
              ],
            },
            designation: "$employeeData.designationData.name",
            submittedOn: "$createdAt",
            lastWorkingDate: 1,
            approver: "$resignationHistoryData.approver",
            resignationHistoryUUID: "$resignationHistoryData.uuid",
          },
        },
      ];
      let result = await ResignationService.findResignationByAggregation(
        pipeline,
        req
      );
      for (let index = 0; index < result.length; index++) {
        const empDetails = result[index];
        if (empDetails.file) {
          let storageResp = await StorageService.get(
            empDetails.file.filePath + "/" + empDetails.file.fileName
          );
          if (typeof storageResp != "string") {
            let buf = Buffer.from(storageResp.Body);
            let base64 = buf.toString("base64");
            let imgSrc64 = "data:image/jpg;base64," + base64;
            empDetails.profilePic = imgSrc64;
          }
        }
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  findResignationByUUID = async (req, res, next) => {
    try {
      let lookups = [];
      let project = {};
      if (req.query.getHistory) {
        const getHistory = req.query.getHistory.toLowerCase() === "true" ? true: req.query.getHistory.toLowerCase() === "false" ? false: null;
        if(!getHistory) throw new Error("Invalid getHistory value.Kindly send either True or False")
        const type = req.query.type;
        lookups.push({
          $lookup: {
            from: "resignationApprovalHistory",
            localField: "uuid",
            foreignField: "resignationUUID",
            pipeline: [
              {
                $match: {
                  $or: [
                    { approver: { $nin: [type,"Admin"] } },
                  ],
                },
              },
            ],
            as: "adminHistoryData",
          },
        });
        project = {
          adminHistoryData: "$adminHistoryData",
        };
      }
      let pipeline = [
        {
          $match: {
            uuid: req.params.uuid,
          },
        },
        {
          $lookup: {
            from: "employee",
            localField: "employeeUUID",
            foreignField: "uuid",
            pipeline: [
              {
                $lookup: {
                  from: "designation",
                  localField: "designation",
                  foreignField: "id",
                  as: "designationData",
                },
              },
              {
                $unwind: {
                  path: "$designationData",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: "employeeData",
          },
        },
        {
          $unwind: {
            path: "$employeeData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "reasons",
            localField: "reasonCode",
            foreignField: "reasonCode",
            as: "reasonData",
          },
        },
        {
          $unwind: {
            path: "$reasonData",
            preserveNullAndEmptyArrays: true,
          },
        },
        ...lookups,
        {
          $project: {
            ...project,
            resignationUUID: "$uuid",
            isOneToOne: "$employeeData.designationData.isOneToOne",
            isCritical: "$employeeData.designationData.isCritical",
            submittedOn: "$createdAt",
            reasonForResignation: "$reasonData.reasonName",
            lastWorkingDateAsPerEmployee: 1,
            details: 1,
            noticePeriodAsPerPolicy: 1,
            lastWorkingDateAsPerPolicy: 1,
            isEarlyExit: 1,
          },
        },
      ];
      console.log("pipeline", JSON.stringify(pipeline));
      let result = await ResignationService.findResignationByAggregation(
        pipeline,
        req
      );
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findResignationByEmployeeUUID = async (req, res, next) => {
    try {
      let pipeline = [
        {
          $match: {
            employeeUUID: req.params.employeeUUID,
          },
        },
        {
          $lookup: {
            from: "resignationApprovalHistory",
            localField: "uuid",
            foreignField: "resignationUUID",
            pipeline: [
              {
                $match: {
                  approvalStatus: "Rejected",
                  isActive: false,
                },
              },
              {
                $lookup: {
                  from: "employee",
                  localField: "approverUUID",
                  foreignField: "uuid",
                  as: "employeeData",
                },
              },
              {
                $unwind: {
                  path: "$employeeData",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: "resignationHistoryData",
          },
        },
        {
          $unwind: {
            path: "$resignationHistoryData",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "reasons",
            localField: "reasonCode",
            foreignField: "reasonCode",
            as: "reasonData",
          },
        },
        {
          $unwind: {
            path: "$reasonData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            dateOfResignation: "$createdAt",
            submittedBy: 1,
            resignationReason: "$reasonData.reasonName",
            resignationDetails: "$details",
            revokedBy: {
              $concat: [
                "$resignationHistoryData.employeeData.firstName",
                " ",
                "$resignationHistoryData.employeeData.lastName",
                " (",
                "$resignationHistoryData.approver",
                ")",
              ],
            },
          },
        },
      ];
      let result = await ResignationService.findResignationByAggregation(
        pipeline,
        req
      );
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findResignationHistoryByEmployeeUUID = async (req, res, next) => {
    try {
      let pipeline = [
        {
          $match: {
            employeeUUID: req.params.employeeUUID,
          },
        },
        {
          $lookup: {
            from: "resignationApprovalHistory",
            localField: "uuid",
            foreignField: "resignationUUID",
            pipeline: [
              {
                $match: {
                  isActive: false,
                  approvalStatus: "Rejected",
                },
              },
            ],
            as: "rejectedResignationHistoryData",
          },
        },
        {
          $unwind: {
            path: "$rejectedResignationHistoryData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "resignationApprovalHistory",
            localField: "uuid",
            foreignField: "resignationUUID",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$isActive", false] },
                      {
                        $or: [
                          { $eq: ["$approvalStatus", "Rejected"] },
                          { $eq: ["$approvalStatus", "Approved"] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: "resignationHistoryData",
          },
        },
        // {
        //   $unwind: {
        //     path: "$resignationHistoryData",
        //     preserveNullAndEmptyArrays: false,
        //   },
        // },
        {
          $lookup: {
            from: "reasons",
            localField: "reasonCode",
            foreignField: "reasonCode",
            as: "reasonData",
          },
        },
        {
          $unwind: {
            path: "$reasonData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            requestSubmissionDate: "$createdAt",
            resignationReason: "$reasonData.reasonName",
            resignationDetails: "$details",
            isEarlyExit: 1,
            lastWorkingDateAsPerEmployee: 1,
            rejectedBy: "$rejectedResignationHistoryData.approver",
            actionTake: {
              $ifNull: ["$status", "Waiting For Final Approval"],
            },
            resignationHistory: "$resignationHistoryData",
          },
        },
      ];
      let result = await ResignationService.findResignationByAggregation(
        pipeline,
        req
      );
      const filteredResult = [];
      for (let index = 0; index < result.length; index++) {
        const data = result[index];
        const comments = [];
        if (data.resignationHistory.length > 0) {
          data.resignationHistory.forEach((history) => {
            comments.push({
              approver: history.approver,
              comments: history.comments,
            });
          });
          data.resignationHistory = comments;
          filteredResult.push(data);
        }
      }
      return res.status(200).send(filteredResult);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findResignationDetailsForTransactionSummary = async (req, res, next) => {
    try {
      if (!req.params.uuid) throw new Error("Resignation UUID is required");
      let pipeline = [
        {
          $match: {
            uuid: req.params.uuid,
          },
        },
        {
          $lookup: {
            from: "employee",
            localField: "employeeUUID",
            foreignField: "uuid",
            as: "employeeData",
          },
        },
        {
          $unwind: {
            path: "$employeeData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "employee",
            localField: "createdBy",
            foreignField: "uuid",
            as: "createdByEmployeeData",
          },
        },
        {
          $unwind: {
            path: "$createdByEmployeeData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "resignationApprovalHistory",
            localField: "uuid",
            foreignField: "resignationUUID",
            pipeline: [
              {
                $lookup: {
                  from: "employee",
                  localField: "approverUUID",
                  foreignField: "uuid",
                  as: "approverData",
                },
              },
              {
                $unwind: {
                  path: "$approverData",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $group: {
                  _id: "$levelOfApprover",
                  histoyByLevel: {
                    $push: {
                      approverName: {$concat: ["$approverData.firstName"," ","$approverData.lastName"]},
                      approvalStatus:"$approvalStatus"
                    },
                  },
                  approver:{$first:"$approver"},
                  levelOfApprover:{$first:"$levelOfApprover"}
                },
              },
              {
                $sort:{
                  levelOfApprover:1
                }
              },
              {
                $project:{
                  _id:0,
                  histoyByLevel:1,
                  approver:1,
                  levelOfApprover:1
                }
              }
            ],
            as: "resignationHistoryData",
          },
        },
        {
          $project: {
            _id:0,
            resignationUUID: "$uuid",
            employeeName: {
              $concat: [
                "$employeeData.firstName",
                " ",
                "$employeeData.lastName",
              ],
            },
            createdByName: {
              $concat: [
                "$createdByEmployeeData.firstName",
                " ",
                "$createdByEmployeeData.lastName",
              ],
            },
            submittedBy:1,
            createdAt:1,
            status:{$ifNull:["$status","Pending"]},
            resignationHistoryDetails: "$resignationHistoryData",
          },
        },
      ];
      console.log("pipeline", JSON.stringify(pipeline));
      let result = await ResignationService.findResignationByAggregation(
        pipeline,
        req
      );
      if(result.length==0)throw new Error("Resignation details not found")
      const formattedResults={
        resignationUUID:result[0].resignationUUID,
        employeeName:result[0].employeeName,
        createdByName:result[0].createdByName,
        submittedBy:result[0].submittedBy,
        createdAt:result[0].createdAt,
        status:result[0].status,
        resignationHistoryDetails:[]
      }
      for(let index=0;index<result[0].resignationHistoryDetails.length;index++){
        const history=result[0].resignationHistoryDetails[index];
        console.log(history)
        let approverName="",approvalStatus="Pending", approveOrRejectedBy=null 
        let isRejected=false;
        await history.histoyByLevel.forEach(async (approverData)=>{
          approverName+=(approverName.length>0?" | ":"")+approverData.approverName
          if(approverData.approvalStatus!=null){
            approvalStatus=approverData.approvalStatus;
            approveOrRejectedBy=approverData.approverName
          }
          if(approverData.approvalStatus=="Rejected")isRejected=true
        })
        formattedResults.resignationHistoryDetails.push({
          approverName:approverName,
          approvalStatus:approvalStatus,
          approveOrRejectedBy:approveOrRejectedBy,
          approver:history.approver,
          levelOfApprover:history.levelOfApprover
        })
        if(isRejected)break;
      }
      formattedResults.resignationHistoryDetails.sort((a,b)=>a.levelOfApprover-b.levelOfApprover)
      return res.status(200).send(formattedResults);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  //create api
  createResignation = async (req, res, next) => {
    try {
      console.log("Create Resignation, Data By: " + JSON.stringify(req.body));
      let data = req.body;
      const query={employeeUUID:data.employeeUUID, status:{$ne:"Rejected"}}
      const existingResignation=await ResignationService.findResignation(query,req)
      if(existingResignation.length>0) throw new Error(existingResignation[0].status==null?"Resignation already applied and is in Pending State":"Your Resignation has already approved")
      // call method to service
      let resp = await ResignationService.createResignation(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  //edit api
  editResignation = async (req, res, next) => {
    try {
      console.log("Update Resignation, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      const historyData =
        await resignationApprovalHistoryService.findResignationApprovalHistory({
          resignationUUID: uuid,
          isActive: false,
        }, req);
      if (historyData.length > 0)
        throw new Error(
          "Someone has already taken action. you can not edit resignation now."
        );

      // call method to service
      let resp = await ResignationService.editResignation(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  cancelResignation = async (req, res, next) => {
    try {
      if (!req.params.uuid) throw new Error("resignation UUID is required");
      const uuid = req.params.uuid;
      console.log(
        "Cancel Resignation, Data By: " + JSON.stringify(req.params.uuid)
      );
      const data = {
        uuid: req.params.uuid,
        isActive: false,
      };
      const historyData =
        await resignationApprovalHistoryService.findResignationApprovalHistory({
          resignationUUID: uuid,
          isActive: false,
        }, req);
      if (historyData.length > 0)
        throw new Error(
          "Someone has already taken action. you can not edit resignation now."
        );
      // call method to service
      let resp = await ResignationService.updateResignation(data, req, res);
      resignationApprovalHistoryService.delete(
        { resignationUUID: uuid },
        req
      );
      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new Resignation();
