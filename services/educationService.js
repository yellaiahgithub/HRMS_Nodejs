const StorageController = require("../controllers/StorageController");
const { switchDB, getDBModel, educationSchema } = require("../middlewares/switchDB");
const StorageService = require("./StorageService");

class EducationService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for education create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, educationSchema)
            const educationModel = await getDBModel(DB, 'education')
            // checkif data.isHighestEducation: true - need to update in other documents as isHighestEducation: false
            if(data.isHighestEducation) {
                const updated =  await educationModel.update(
                {employeeUUID : data.employeeUUID, isHighestEducation: true},
                {isHighestEducation:false});
                console.log(updated)
            }

            const result =  await educationModel.insertMany([data], { runValidators: true })
            return result;
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    aggregate = async (pipeline, req) => {
        try {
            console.log('Get Education, Data By: ' + JSON.stringify(pipeline))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, educationSchema)
            const educationModel = await getDBModel(DB, 'education')
            return await educationModel.aggregate(pipeline)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (query, req, res) => {
        try {
            console.log('Get Education, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, educationSchema)
            const educationModel = await getDBModel(DB, 'education')
            const result = await educationModel.find(query)
            if(result?.length >0) {
                for (const element of result) {
                    if(element.filePath && element.fileName){
                        let path = element.filePath + "/" + element.fileName;
                        const storageResp = await StorageService.get(path);
                        if(storageResp) {
                            res.set({
                                'Content-Type': 'image/jpeg',
                                //'Content-Disposition': `attachment; filename="${response[0].fileName}"`
                              });
                              let buf = Buffer.from(storageResp.Body);
                              let base64 = buf.toString("base64");
                            //   res.send(base64);
                            element.file = base64;
                        }
                    }
                }
               
            }
            return result;
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findEducationById = async (query, req, res) => {
        try {
            console.log('Get Education, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, educationSchema)
            const educationModel = await getDBModel(DB, 'education')
            const result = await educationModel.find(query).lean();
            if(result?.length >0) {
                for (const element of result) {
                    if(element.filePath && element.fileName){
                        let path = element.filePath + "/" + element.fileName;
                        const storageResp = await StorageService.get(path);
                        if(storageResp) {
                            res.set({
                                'Content-Type': 'image/jpeg',
                                //'Content-Disposition': `attachment; filename="${response[0].fileName}"`
                              });
                              let buf = Buffer.from(storageResp.Body);
                              let base64 = buf.toString("base64");
                            //   res.send(base64);
                            element.file = base64;
                        }
                    }
                }
               
            }
            return result;
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update =  async (data, req) => {
        try {
          console.log('Update Education, Data: ' + JSON.stringify(data))
          const companyName = req.subdomain
            const DB = await switchDB(companyName, educationSchema)
            const educationModel = await getDBModel(DB, 'education')

            // checkif data.isHighestEducation: true - need to update in other documents as isHighestEducation: false
            if(data.isHighestEducation) {
                const updated =  await educationModel.update(
                {employeeUUID : data.employeeUUID, isHighestEducation: true},
                {isHighestEducation:false});
                console.log(updated)
            }

          // find and update record in mongoDB
          return await educationModel.updateOne({ _id: data._id }, { $set: data }, { upsert: true })
        } catch (error) {
            console.log(error)
          throw new Error(error);
        }
      }

      delete = async (query, req) => {
        try {
            console.log("Data for Education Detail update", query);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, educationSchema)
            const educationModel = await getDBModel(DB, 'education')
            const deletedObj = await educationModel.findOneAndDelete(
                query
            );
            // if(deletedObj.filePath && deletedObj.fileName) {
            //     await StorageService.delete(deletedObj.filePath + '/'+ deletedObj.fileName);
            // }
            return deletedObj;
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      };

}

module.exports = new EducationService()