const PermissionService = require('../services/permissionService.js');
const {v4: uuidv4} = require('uuid');

class Permission {
    constructor() { }

    createPermission = async (req, res, next) => {
        try {

            console.log('Create Permission, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for Permission
            let count = await PermissionService.getPermissionCounts(req);
            if(!count) {
              count = 1
            } else {
              count++;
            } 
            data.id =  count;
            // call method to service
            let resp = await PermissionService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findPermissionByIdOrName = async (req, res, next) => {
        try {
            console.log('Find Permission, Data By: ' + JSON.stringify(req.query))
            if(!req.query.permissionName && !req.query.uuid && !req.query.permissionId) { throw new Error("No data found for search Permission")}
            let query = {};
            if (req.query.permissionName != undefined) {
                query =  {permissionName:  { $regex : req.query.permissionName, '$options' : 'i' } } 
            }
            if (req.query.uuid != undefined) {
                query.uuid = req.query.uuid;
            }
            if (req.query.permissionId != undefined) {
                query =  {permissionId:  { $regex : req.query.permissionId, '$options' : 'i' } } 
            }

            let pipeline = [
                {
                  $match: {
                   ...query
                  }
                },
                {
                  $lookup: {
                    from: "customer",
                    localField: "customerUUID",
                    foreignField: "uuid",
                    as: "customer"
                  }
                },
              ];
            // call method to service
            let result = await PermissionService.findPermissionById(pipeline, req, res);

            if (!result) {
                return res.status(404).send('Permission not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find Permission, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let pipeline = [
                {
                  $match: {
                   ...query
                  }
                },
              ];
            // call method to service
            let result = await PermissionService.findAll(pipeline, req, res);

            if (!result) {
                return res.status(404).send('Permission not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    updatePermission = async (req, res) => {
        try {
         
    
          if (Object.keys(req.body).length === 0) {
            return apiResponse.notFoundResponse(res, `No permission data found for update`);
          }
          if (!req.params.permissionId) return apiResponse.errorResponse(res, "Please send PermissionId");
    
          const data = req.body
          data.updatedAt = new Date()
          let permissionId = req.params.permissionId
          // call method to service
          let resp = await PermissionService.update(permissionId, data, req, res);
          if (resp) {
            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(`No permission found for the permissionId provided:${permissionId}`);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
      }
}

module.exports = new Permission()