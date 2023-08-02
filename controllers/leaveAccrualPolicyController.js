const LeaveAccrualPolicyService = require("../services/leaveAccrualPolicyService");

class LeaveAccrualPolicy {
  constructor() {}

  findLeaveAccrualPolicy = async (req, res, next) => {
    try {
      let query = {}
      if(req.query.uuid) query.uuid=req.query.uuid
      if(req.query.leaveTypeUUID) query.leaveTypeUUID=req.query.leaveTypeUUID      // call method to service
      let result = await LeaveAccrualPolicyService.findLeaveAccrualPolicy(query, req, res);

      if (!result) {
        return res.status(404).send("LeaveAccrualPolicy not found in the database");
      }
      if(req.query.uuid) return res.status(200).send(result[0]);
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  findAll = async (req, res, next) => {
    try {
      console.log("Find LeaveAccrualPolicy, Data By: " + JSON.stringify(req.params));

      let pipeline = [
        {
          $lookup: {
            from: "leaveType",
            localField: "leaveTypeUUID",
            foreignField: "uuid",
            as: "leaveType"
          }
        },
        {
          $unwind: {
            path: '$leaveType',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project:{
            _id:0,
            uuid:1,
            id:1,
            accrualCriteria:1,
            leaveTypeUUID:1,
            leaveTypeName:"$leaveType.name",
            description:1,
            rules:1,
            createdAt:1,
            updatedAt:1
          }
        }
      ]
      // call method to service
      let result = await LeaveAccrualPolicyService.aggregate(pipeline, req, res);

      if (!result) {
        return res.status(404).send("LeaveAccrualPolicy not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createLeaveAccrualPolicy = async (req, res, next) => {
    try {
      console.log("Create LeaveAccrualPolicy, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await LeaveAccrualPolicyService.createLeaveAccrualPolicy(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateLeaveAccrualPolicy = async (req, res, next) => {
    try {
      console.log("Update LeaveAccrualPolicy, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await LeaveAccrualPolicyService.updateLeaveAccrualPolicy(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new LeaveAccrualPolicy();
