const { switchDB, getDBModel, emergencyContactSchema, uploadResultsSchema, employeeInfoHistorySchema } = require("../middlewares/switchDB");
const employeeService = require("./employeeService");
const emergencyContactUtils = require("../utils/emergencyContactUtils.js");
const employeeInfoHistoryService = require("./employeeInfoHistoryService");
class EmergencyContactService {
  constructor() {}

  create = async (data, req, res) => {
    try {
        console.log('Data for action create', data);
        
        const companyName = req.subdomain
        const emergencyContactDB = await switchDB(companyName, emergencyContactSchema)
        const emergencyContactModel = await getDBModel(emergencyContactDB, 'emergencyContact')
        const historyDB = await switchDB(companyName, employeeInfoHistorySchema);
        const employeeInfoHistoryModel = await getDBModel(
          historyDB,
          "employeeInfoHistory"
        );
          if(data.isPrimary) {
          const updated =  await emergencyContactModel.update(
            {employeeUUID : data.employeeUUID, isPrimary: true},
            {isPrimary:false});
            const historyUpdated = await employeeInfoHistoryModel.update(
              { employeeUUID: data.employeeUUID, type:"EmployeeEmergencyContact" },
              { $set: { "historyObject.isPrimary": false } }
            );    
            console.log(updated)
        }
        //  if it is the first record and if isPrimary is not true then it should be made true 
        const exist = await emergencyContactModel.find({employeeUUID : data.employeeUUID, isPrimary: true}).lean();
        if(exist && exist.length == 0) {
          data.isPrimary = true;
        }

        let savedEmergencyContact = await emergencyContactModel.insertMany([data], { new:true, runValidators: true })

        savedEmergencyContact = savedEmergencyContact[0]?._doc
        // store History for EmergencyContact
        const history = {
          employeeUUID: data.employeeUUID,
          documentUUID: savedEmergencyContact?.uuid,
          type: "EmployeeEmergencyContact",
          name: "CREATE",
          historyObject: {
            contactName: data.contactName,
            relationship: data.relationship,
            phoneNo: data.phoneNo,
            isPrimary: data.isPrimary,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            country: data.country,
            state: data.state,
            city: data.city,
            addressSameAsEmployee: data.addressSameAsEmployee,
            pinCode: data.pinCode,
          },
          effectiveDate: data?.effectiveDate ?? new Date(),
          reason: data?.reason ?? "Create new Employee EmergencyContact",
          isDeleted: false,
        }
      
        const savedHistory = await employeeInfoHistoryService.storeHistory(
          history, req
        );

        savedEmergencyContact["historyUUID"] = savedHistory[0]?.uuid
      return savedEmergencyContact;
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
  }
  
  updateEmergencyContact = async (data, req) => {
    try {
      console.log("Data for emergencyContact update", data);
      const companyName = req.subdomain
      const emergencyContactDB = await switchDB(companyName, emergencyContactSchema)
      const emergencyContactModel = await getDBModel(emergencyContactDB, 'emergencyContact')
      const historyDB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        historyDB,
        "employeeInfoHistory"
      );
      
      // checkif data.isPrimary: true - need to update in other address isPrimary: false
      if(data.isPrimary) {
        const updated =  await emergencyContactModel.update(
          {employeeUUID : data.employeeUUID, isPrimary: true},
          {isPrimary:false});
          const historyUpdated = await employeeInfoHistoryModel.update(
            { employeeUUID: data.employeeUUID, type:"EmployeeEmergencyContact" },
            { $set: { "historyObject.isPrimary": false } }
          );
          console.log(updated)
      }
      //  if it is the first record and if isPrimary is not true then it should be made true 
      // const exist = await emergencyContactModel.find({employeeId : data?.employeeId, isPrimary: true}).lean();
      // if(exist && exist.length > 0 && data.isPrimary == false) { 
      //   return `this one is Primary address you can't update it as a primary false`
      // }

      const updatedEmergencyContact = await emergencyContactModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { new : true }
      );

      const historyObject = {
        contactName: data.contactName,
        relationship: data.relationship,
        phoneNo: data.phoneNo,
        isPrimary: data.isPrimary,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        country: data.country,
        state: data.state,
        city: data.city,
        addressSameAsEmployee: data.addressSameAsEmployee,
        pinCode: data.pinCode,
      }

      if(data?.historyUUID) {
        const historyObj = {
          name : "UPDATE",
          updateAt : new Date(),
          historyObject,
          reason: data.reason ?? "Updated Employee EmergencyContact",
          effectiveDate: data.effectiveDate ?? new Date()
        }
        await employeeInfoHistoryModel.updateOne(
          { uuid: data.historyUUID },
          { $set: historyObj },
          { upsert: false }
        );
      } else {
        // store History
        const history = {
          employeeUUID: data.employeeUUID,
          documentUUID: data.uuid,
          type: "EmployeeEmergencyContact",
          name: "UPDATE",
          historyObject,
          effectiveDate: data.effectiveDate ?? new Date(),
          reason: data?.reason ?? "Updated Employee EmergencyContact",
          isDeleted: false,
        }
        await employeeInfoHistoryService.storeHistory(
          history, req
        );
       }
      return updatedEmergencyContact;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmergencyContactById = async (query, req) => {
    try {
      console.log("Get emergencyContact, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
            const DB = await switchDB(companyName, emergencyContactSchema)
            const emergencyContactModel = await getDBModel(DB, 'emergencyContact')
      return await emergencyContactModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (pipeline, req) => {
    try {
      console.log("Get emergencyContact, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain
            const DB = await switchDB(companyName, emergencyContactSchema)
            const emergencyContactModel = await getDBModel(DB, 'emergencyContact')
      return await emergencyContactModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  deleteEmergencyContact = async (query, body, req) => {
    try {
      console.log("Data for emergencyContact update", query);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, emergencyContactSchema)
      const emergencyContactModel = await getDBModel(DB, 'emergencyContact')

       // store History
       const HistoryDB = await switchDB(companyName, employeeInfoHistorySchema);
       const employeeInfoHistoryModel = await getDBModel(
        HistoryDB,
         "employeeInfoHistory"
       );
       const historyObj = {
         name :"DELETE",
         reason: body?.reason ?? "Delete Employee EmergencyContact",
         isDeleted : true
       }
       await employeeInfoHistoryModel.updateOne(
         { documentUUID: query.uuid },
         { $set: historyObj },
         { upsert: false }
       );

      return await emergencyContactModel.findOneAndDelete(
        query
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  createAllEmergencyContacts = async (data, req, res) => {
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
     
        const EmergencyContactDB = await switchDB(req.subdomain, emergencyContactSchema);
        const uploadResultsDB = await switchDB(
          req.subdomain,
          uploadResultsSchema
        );
        const emergencyContactModel = await getDBModel(EmergencyContactDB, "emergencyContact");
        const uploadResultsModel = await getDBModel(uploadResultsDB, "uploadResults");
        
        CSVHeader.push(
          { label: "Employee_Id", key: "employeeId" },
          { label: "Contact_Name", key: "contactName" },
          { label: "Relationship", key: "relationship" },
          { label: "Phone_Number", key: "phoneNo" },
          { label: "Is_Primary", key: "isPrimary" },
          { label: "Address_Line_1", key: "addressLine1" },
          { label: "Address_Line_2", key: "addressLine2" },
          { label: "Country", key: "country" },
          { label: "State", key: "state" },
          { label: "City", key: "city" },
          { label: "PIN_Code", key: "pinCode" },
        );
        if(!forValidationOnly) {
          let uploadingData = {
            type: "EmergencyContact",
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
        const emergencyContact = data.data[i];
        
        console.log("processing the record: ", i + 1);
        const errors = await emergencyContactUtils.validateEmergencyContact(
          emergencyContact,
          allEmployees
        );
        if (errors.length > 0) {
          const errorData = { ...emergencyContact };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            if(!forValidationOnly) {
              if(emergencyContact?.employeeId && allEmployees?.length>0) {
                emergencyContact.employeeUUID = allEmployees.find(e => e.id == emergencyContact.employeeId)?.uuid
              }
              // if isPrimary true then other docs need to update as a false
              if(emergencyContact.isPrimary) {
                const updated =  await emergencyContactModel.update(
                  {employeeUUID : emergencyContact.employeeUUID, isPrimary: true},
                  {isPrimary:false});
                  console.log(updated)
              }
              
              //  if it is the first record and if isPrimary is not true then it should be made true 
              const exist = await emergencyContactModel.find({employeeUUID : emergencyContact.employeeUUID, isPrimary: true}).lean();
              if(exist && exist.length == 0) {
                emergencyContact.isPrimary = true;
              }
              
              const emergencyContactData = {
                ...emergencyContact,
                status: true,
              };

              const savedEmergencyContact = await emergencyContactModel.insertMany(
                [emergencyContactData],
                {new: true, runValidators: true }
              );

              // store History for EmergencyContact
              const history = {
                employeeUUID: emergencyContact.employeeUUID,
                documentUUID: savedEmergencyContact[0]?.uuid,
                type: "EmployeeEmergencyContact",
                name: "CREATE",
                historyObject: {
                  contactName: emergencyContact.contactName,
                  relationship: emergencyContact.relationship,
                  phoneNo: emergencyContact.phoneNo,
                  isPrimary: emergencyContact.isPrimary,
                  addressLine1: emergencyContact.addressLine1,
                  addressLine2: emergencyContact.addressLine2,
                  country: emergencyContact.country,
                  state: emergencyContact.state,
                  city: emergencyContact.city,
                  addressSameAsEmployee: emergencyContact.addressSameAsEmployee,
                  pinCode: emergencyContact.pinCode,
                },
                effectiveDate: new Date(),
                reason: "Create new Employee EmergencyContact",
                isDeleted: false,
              }
            
              const savedHistory = await employeeInfoHistoryService.storeHistory(
                history, req
              );

              if (savedEmergencyContact.length > 0) {
                savedEmergencyContact["errors"] = [];
                sucessList.push(savedEmergencyContact);
                sucessfullyAddedCount++;
              }
            } else {
              const errorData = { ...emergencyContact };
              errorData.errors = [];
              errorList.push(errorData);
            }
          } catch (error) {
            const errorData = { ...emergencyContact };
            errorData.errors = error.errors?.code?.properties?.message;
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
}

module.exports = new EmergencyContactService();
