const LeaveAccumulationPolicyService = require("../services/leaveAccumulationPolicyService");

class LeaveAccumulationPolicy {
  constructor() {}

  findLeaveAccumulationPolicy = async (req, res, next) => {
    try {
      let query = {};
      if(req.query.uuid) query.uuid=req.query.uuid
      if(req.query.leaveTypeUUID) query.leaveTypeUUID=req.query.leaveTypeUUID
      // call method to service
      let result = await LeaveAccumulationPolicyService.findLeaveAccumulationPolicy(query, req, res);

      if (!result) {
        return res.status(404).send("LeaveAccumulationPolicy not found in the database");
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
      console.log("Find LeaveAccumulationPolicy, Data By: " + JSON.stringify(req.params));
      
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
      let result = await LeaveAccumulationPolicyService.aggregate(pipeline,req, res);

      if (!result) {
        return res.status(404).send("LeaveAccumulationPolicy not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createLeaveAccumulationPolicy = async (req, res, next) => {
    try {
      console.log("Create LeaveAccumulationPolicy, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await LeaveAccumulationPolicyService.createLeaveAccumulationPolicy(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateLeaveAccumulationPolicy = async (req, res, next) => {
    try {
      console.log("Update LeaveAccumulationPolicy, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await LeaveAccumulationPolicyService.updateLeaveAccumulationPolicy(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new LeaveAccumulationPolicy();
