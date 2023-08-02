const DownloadResultsService = require("../services/downloadResultsService");
const apiResponse = require("../helper/apiResponse");

class DownloadResults {
  constructor() {}

  findAll = async (req, res, next) => {
    try {
      let result = [];
      const data = req.query.data;
      let skiplimit = []
      if(req.query.offset && req.query.limit){
        skiplimit = [
          { $skip: Number(req.query?.offset)},
          { $limit: Number(req.query?.limit) }
        ] 
      }
      let pipeline = [
        {
          $match: data && {
              $or: [
                { 'type': { '$regex':data,$options:"si"  } },
                { 'status': { '$regex': data,$options:"si"  } }
              ]
            
          } || {}
        },
        ...skiplimit,
        {
          '$sort': {
            'createdAt': -1
          }
        },
        {
          $lookup: {
            from: "employee",
            localField: "downloadedBy",
            foreignField: "uuid",
            as: "employee"
          }
        },
        {
          $unwind: {
            path: "$employee",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          '$sort': {
            'createdAt': -1
          }
        },
        {
          $project: {
            downloadedBy: 1,
            downloadedByName: {$ifNull: [{
              $concat: ["$employee.firstName", " ", "$employee.lastName"]},"Admin"
            ]},
            uuid: 1,
            type: 1,
            fileName: 1,
            status: 1,
            downloadedData: 1,
            reportHeader:1,
            createdAt: 1,
            updatedAt: 1,
          }
        }
      ]

      

      result = await DownloadResultsService.aggregate(pipeline, req)
      
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  delete = async (req, res, next) => {
    try {
      if (!req.query.uuid)
        throw new Error("Please send uuid of the record to delete.");
      const query = { uuid: req.query.uuid };
      let result = await DownloadResultsService.delete(query, req);
      if (result?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No Result found for the uuid provided:${query.uuid} to delete`
        );
      }
      return apiResponse.successResponse(res, "Successfully deleted");
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new DownloadResults();
