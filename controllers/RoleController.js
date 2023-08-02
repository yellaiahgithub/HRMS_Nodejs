const RoleService = require('../services/roleService.js');
const { v4: uuidv4 } = require('uuid');
const employeeService = require('../services/employeeService.js');

class Role {
  constructor() { }

  createRole = async (req, res, next) => {
    try {

      console.log('Create Role, Data By: ' + JSON.stringify(req.body))
      let data = req.body;
      data.uuid = uuidv4(); // unique id for Role
      let resp = await RoleService.create(data, req, res);
      return res.status(200).send(resp)
    } catch (error) {
      console.error(error)
      res.status(400).send(error.message)
    }
  }

  //FOR ASSIGN LIST - get employees who not assigned that roleUUID 
  findAssignedUsersByRoleUUID = async (req, res, next) => {
    try {
      console.log('Find Role, Data By: ' + JSON.stringify(req.query))
      if (!req.query.roleUUID) { throw new Error("No data found for search Role") }
      let query = {};
      query.uuid = req.query.roleUUID;

      let pipeline = [
        
        {
          $match:{
            roleUUIDs:{$nin :[query.uuid]},
          }
        },
        {
          $project: {
            _id: 0,
            uuid: 1, //roleUUID
            firstName: "$firstName",
            lastName: "$lastName",
            username: "$username",
            employeeUUID: "$uuid",
            userId: "$userId",
            id: "$id"
          }
        },
        {
          '$sort': {
            'firstName': 1
          }
        },
      ];
      // call method to service
      let result = await employeeService.findEmployeesAgg(pipeline, req, res);

      if (!result) {
        return res.status(404).send('Role not found in the database')
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error)
      res.status(400).send(error.message)
    }
  }

  
  // FOR UNASSIGN LIST - get assigned employees list by roleUUID
  findUnAssignedUsersByRoleUUID = async (req, res, next) => {
    try {
      console.log('Find Role, Data By: ' + JSON.stringify(req.query))
      if (!req.query.roleUUID) { throw new Error("No data found for search Role") }
      let query = {};
      query.uuid = req.query.roleUUID;

      let pipeline = [
        {
          $match: {
            ...query
          }
        },
        {
          $lookup: {
            from: "employee",
            localField: "uuid",
            foreignField: "roleUUIDs",
            as: "employee"
          }
        },
        {
          $unwind: {
            'path': "$employee",
            'preserveNullAndEmptyArrays': false
          }
        },

        {
          $project: {
            firstName: "$employee.firstName",
            lastName: "$employee.lastName",
            username: "$employee.username",
            employeeUUID: "$employee.uuid",
            userId: "$employee.userId",
            id: "$employee.id"
          }
        },
        {
          '$sort': {
            'employee.firstName': 1
          }
        },
      ];
      // call method to service
      let result = await RoleService.findRoleById(pipeline, req, res);

      if (!result) {
        return res.status(404).send('Role not found in the database')
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error)
      res.status(400).send(error.message)
    }
  }

  // Fetch Roles by UserID
  fetchRolesByEmployeeUUID = async (req, res, next) => {
    try {
      console.log('Find Role, Data By: ' + JSON.stringify(req.query))
      if (!req.query.employeeUUID) { throw new Error("No data found for search Role") }
      let query = {};
      query.uuid = req.query.employeeUUID;
      // call method to service
      let pipeline = [
        {
          $match: {
            ...query
          }
        },
        {
          $lookup: {
            from: "roles",
            localField: "roleUUIDs",
            foreignField: "uuid",
            as: "roles"
          }
        },
        {
          $project:{
            _id:0,
            roles:1
          }
        }
      ];
      // call method to service
      let result = await employeeService.findEmployeesAgg(pipeline, req, res);

      if (!result) {
        return res.status(404).send('Role not found in the database')
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error)
      res.status(400).send(error.message)
    }
  }
  findAll = async (req, res, next) => {
    try {
      console.log('Find Role, Data By: ' + JSON.stringify(req.params))
      let query = { isActive: true };
      // call method to service
      let pipeline = [
        {
          $match: {
            ...query
          }
        },
        {
          $lookup: {
            from: "permissions",
            localField: "permissions",
            foreignField: "uuid",
            as: "permissions"
          }
        },
      ];
      // call method to service
      let result = await RoleService.findAll(pipeline, req, res);

      if (!result) {
        return res.status(404).send('Role not found in the database')
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error)
      res.status(400).send(error.message)
    }
  }

  updateRole = async (req, res) => {
    try {


      if (Object.keys(req.body).length === 0) {
        return apiResponse.notFoundResponse(res, `No role data found for update`);
      }
      if (!req.params.roleId) return apiResponse.errorResponse(res, "Please send RoleId");

      const data = req.body
      data.updatedAt = new Date()
      let roleId = req.params.roleId
      // call method to service
      let resp = await RoleService.update(roleId, data, req, res);
      if (resp) {
        return res.status(200).send(resp)
      } else {
        return res.status(400).send(`No role found for the roleId provided:${roleId}`);
      }
    } catch (error) {
      console.log(error)
      res.status(400).send(error.message)
    }
  }
}

module.exports = new Role()