const { switchDB, getDBModel, nationIDSchema, uploadResultsSchema } = require("../middlewares/switchDB");
const employeeService = require("./employeeService");
const nationIdUtils = require("../utils/nationIdUtils.js");
var moment = require("moment"); 
const { generateMail } = require("../utils/mailNotificationUtils");
const { MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");
class NationIdService {
  constructor() { }

  create = async (data, req, res) => {
    try {
      console.log("Data for nationID create", data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, nationIDSchema)
      const nationIDModel = await getDBModel(DB, 'nationID')
      // checkif data.isPrimary: true - need to update in other nationId isPrimary: false
      if(data.isPrimary) {
       const updated =  await nationIDModel.update(
          {employeeUUID : data.employeeUUID, isPrimary: true},
          {isPrimary:false});
          console.log(updated)
      }
      const result = await nationIDModel.insertMany([data], { runValidators: true });
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.ADD_NATIONAL_ID,body,req,data)
      return result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  update = async (data, req, res) => {
    try {
      console.log("Data for nationID update", data);
      const companyName = req.subdomain
      const companyDB = await switchDB(companyName, nationIDSchema)
      const nationIDModel = await getDBModel(companyDB, 'nationID')
      // checkif data.isPrimary: true - need to update in other nationId isPrimary: false
      if(data.isPrimary) {
        const updated =  await nationIDModel.update(
           {employeeUUID : data.employeeUUID, isPrimary: true},
           {isPrimary:false});
           console.log(updated)
       }
       const result =  await nationIDModel.updateOne(
        { _id: data._id },
        { $set: data },
        { upsert: true },
        // { runValidators: true },
      );
      const inputObj=await nationIDModel.findOne({uuid:data.uuid})
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_NATIONAL_ID,body,req,inputObj)
      return result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  // delete record by UUID
  delete = async (uuid, req, res) => {
    try {
      console.log('Delete NationId, Data: ' + JSON.stringify(uuid))
      const companyName = req.subdomain
      const companyDB = await switchDB(companyName, nationIDSchema)
      const nationIDModel = await getDBModel(companyDB, 'nationID')

      //to Generate Mail we have to fetch the record details
      const inputObj=await nationIDModel.findOne({uuid: uuid})

      // find and delete record in mongoDB
      const result= await nationIDModel.deleteOne({ uuid: uuid })

      //send mail
      const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.DELETE_NATIONAL_ID,body,req,inputObj)
      return result;
    } catch (error) {
      console.log(error)
      throw new Error(error);
    }
  }

  findAll = async (query, req, res) => {
    try {
      console.log("Get nationID, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const companyDB = await switchDB(companyName, nationIDSchema)
      const nationIDModel = await getDBModel(companyDB, 'nationID')
      return await nationIDModel.find(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };



  findNationIDByEmployeeId = async (query, req, res) => {
    try {
      console.log("Get nationID, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const companyDB = await switchDB(companyName, nationIDSchema)
      const nationIDModel = await getDBModel(companyDB, 'nationID')
      return await nationIDModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  createAllNationIds = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      let forValidationOnly = data?.forValidationOnly
      
      let CSVHeader = [];
      let createUploadResult = []
      const allEmployees = await employeeService.findEmployeesByQuery(
        {
          isActive: true,
        },
        // {
        //   _id:0,
        //   id:1,
        //   uuid:1,
        // },
        req
      );
     
        const NationIdDB = await switchDB(req.subdomain, nationIDSchema);
        const uploadResultsDB = await switchDB(
          req.subdomain,
          uploadResultsSchema
        );
        const nationIdModel = await getDBModel(NationIdDB, "nationID");
        const uploadResultsModel = await getDBModel(uploadResultsDB, "uploadResults");
        
        CSVHeader.push(
              { label: "EmployeeId", key: "employeeId" },
              { label: "Country", key: "country" },
              { label: "Identification_Type", key: "identificationType" },
              { label: "Identification_Number", key: "IdentificationNumber" },
              { label: "Name_As_Per_Document", key: "name" },
              { label: "Is_Expiry(true/false)", key: "isExpiry" },
              { label: "Expiry_Date(DD/MM/YYYY)", key: "expiry" },
              { label: "Is_Primary(true/false)", key: "isPrimary" },
        );
        if(!forValidationOnly) {
          let uploadingData = {
            type: "nationId",
            uploadedBy: req?.subdomain ,
            fileName: data.fileName,
            errorFileName: data.fileName,
            status: "InProgress",
            uploadedData: data.data,
            createdAt: new Date(),
            csvHeader: CSVHeader,
          };
          createUploadResult = await uploadResultsModel.insertMany(
            [uploadingData],
            {
              runValidators: true,
            }
          );
        }
      for (let i = 0; i < data.data?.length > 0; i++) {
        const nationId = data.data[i];
        
        console.log("processing the record: ", i + 1);
        const errors = await nationIdUtils.validateNationId(
          nationId,
          allEmployees
        );
        if (errors.length > 0) {
          const errorData = { ...nationId };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            if(!forValidationOnly) {
              // convert date in iSO format
              if(nationId?.expiry) {
                nationId["expiry"] = new Date(
                  moment(nationId.expiry, "DD/MM/YYYY")
                );
              }

              if(nationId?.employeeUUID && allEmployees?.length>0) {
                nationId.employeeUUID = allEmployees.find(e => e.id == nationId.employeeUUID)?.uuid
              }
              
              // if isPrimary true then other docs need to update as a false
              if(nationId.isPrimary) {
                const updated =  await nationIdModel.update(
                  {employeeUUID : nationId.employeeUUID, isPrimary: true},
                  {isPrimary:false});
                  console.log(updated)
              }
              //  if it is the first record and if isPrimary is not true then it should be made true 
              const exist = await nationIdModel.find({employeeUUID : nationId.employeeUUID, isPrimary: true}).lean();
              if(exist && exist.length == 0) {
                nationId.isPrimary = true;
              }
              
              const nationIdData = {
                ...nationId,
              };

              const savedNationId = await nationIdModel.insertMany(
                [nationIdData],
                { runValidators: true }
              );
              if (savedNationId.length > 0) {
                savedNationId["errors"] = [];
                sucessList.push(savedNationId);
                sucessfullyAddedCount++;
              }
            } else {
              const errorData = { ...nationId };
              errorData.errors = [];
              errorList.push(errorData);
            }
          } catch (error) {
            const errorData = { ...nationId };
            if (error.message.includes("`identificationType` to be unique")) {
              error.message = 'National Type already exist for this employee'
            }
            errorData.errors = error?.errors?.code ? error?.errors?.code?.properties?.message : error.message; 
            errorList.push(errorData);
            errorCount++;
            console.log("error occured while saving record", i + 1);
            console.log("err", error);
          }
        }
        console.log("processed record", i + 1);
      }
      if(!forValidationOnly) {
        const updateUploadResult = await uploadResultsModel.updateOne(
          { _id: createUploadResult[0]._id },
          {
            $set: {
              status:
                sucessfullyAddedCount == data.data.length ? "Sucess" : "Rejected",
              errorData: errorList,
              updatedAt: new Date(),
            },
          },
          { upsert: false, runValidators: true }
        );
      }
      console.log();
      return {
        totalRecords: data.data.length,
        sucessfullyAdded: sucessfullyAddedCount,
        errorCount: errorCount,
        errorData: errorList,
        sucessData: sucessList,
        data: data.data,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  aggregate = async (pipeline, req) => {
    try {
      console.log("Get nationID, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain
      const companyDB = await switchDB(companyName, nationIDSchema)
      const nationIDModel = await getDBModel(companyDB, 'nationID')
      return await nationIDModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new NationIdService();
