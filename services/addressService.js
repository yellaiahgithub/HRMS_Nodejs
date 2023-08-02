const { switchDB, getDBModel, addressSchema, employeeSchema, uploadResultsSchema, employeeInfoHistorySchema } = require("../middlewares/switchDB");
const apiResponse = require('../helper/apiResponse')
const employeeAddressUtils = require("../utils/employeeAddressUtils");
const EmployeeInfoHistoryService = require("../services/employeeInfoHistoryService");

class AddressService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for address create', data);
            const DB = await switchDB(req.subdomain, addressSchema)
            const addressModel = await getDBModel(DB, 'address')
            // checkif data.isPrimary: true - need to update in other address isPrimary: false
            const existingAddresswithSameType = await addressModel.find({employeeUUID : data.employeeUUID, addressType:data.addressType,isActive: true}).lean(); 
            if(existingAddresswithSameType.length>0)
              throw new Error( `Duplicate address record with same type `+data.addressType+`.`)

            if(data.isPrimary) {
              const updated =  await addressModel.update(
                {employeeUUID : data.employeeUUID, isPrimary: true},
                {isPrimary:false});
                console.log(updated)
            }
            //  if it is the first record and if isPrimary is not true then it should be made true 
            const employeeAddressExist = await addressModel.find({employeeUUID : data.employeeUUID, isPrimary: true}).lean();
            if(employeeAddressExist && employeeAddressExist.length == 0) { 
              data.isPrimary = true;
            }
            if(data.employeeUUID) data.employeeUUID = data.employeeUUID
            let savedEmployeeAddress = await addressModel.insertMany([data], { runValidators: true })
            savedEmployeeAddress = savedEmployeeAddress[0]?._doc
            // store History
            const history = {
              employeeUUID: data.employeeUUID,
              documentUUID: savedEmployeeAddress?.uuid,
              type: "EmployeeAddress",
              name: "CREATE",
              historyObject : {
                addressType:data.addressType,
                isActive:data.isActive,
                address1:data.address1,
                address2:data.address2,
                address3:data.address3,
                country:data.country,
                state:data.state,
                city:data.city,
                PIN:data.PIN,
                isPrimary:data.isPrimary,
                file:data.file
            },
              effectiveDate: data?.effectiveDate ?? new Date(),
              reason: data?.reason ?? "Create new Address",
              isDeleted: false,
            }
            const savedHistory = await EmployeeInfoHistoryService.storeHistory(
              history, req
            );
            if(data.isHistory) return savedHistory;
            return savedEmployeeAddress;
      
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAddressById = async (query, req) => {
        try {
            console.log('Get Address, Data By: ' + JSON.stringify(query))
            const DB = await switchDB(req.subdomain, addressSchema)
            const addressModel = await getDBModel(DB, 'address')
            return await addressModel.find(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    aggregate = async (pipeline, req) => {
      try {
          console.log('Get Address, Data By: ' + JSON.stringify(pipeline))
          const DB = await switchDB(req.subdomain, addressSchema)
          const addressModel = await getDBModel(DB, 'address')
          return await addressModel.aggregate(pipeline);
      } catch (error) {
          console.log(error)
          throw new Error(error);
      }
    }

    update =  async (query, data, req) => {
        try {
          console.log('Update Address, Data: ' + JSON.stringify(data))
            const DB = await switchDB(req.subdomain, addressSchema)
            const addressModel = await getDBModel(DB, 'address')

            // checkif data.isPrimary: true - need to update in other address isPrimary: false
            if(data.isPrimary) {
              const updated =  await addressModel.update(
                {employeeUUID : data.employeeUUID, isPrimary: true},
                {isPrimary:false});
                console.log(updated)
            }
            if(data.status == false || data.isActive == false)  {data.isPrimary = false}
            //  if it is the first record and if isPrimary is not true then it should be made true 
            const employeeAddressExist = await addressModel.find({uuid : query?.uuid, isPrimary: true}).lean();
            if(employeeAddressExist && employeeAddressExist.length > 0 && data.isPrimary == false) { 
              return `this one is Primary address you can't update it as a primary false`
            }
            const existingAddresswithSameType = await addressModel.findOne({employeeUUID : data.employeeUUID, addressType:data.addressType,isActive: true}).lean(); 
            if(existingAddresswithSameType&& existingAddresswithSameType.uuid!=data.uuid)
              return `Duplicate address record with same type `+data.addressType+`.`
          // find and update record in mongoDB
          const updatedObj = await addressModel.updateOne(query, data,{ upsert: false, runValidators: true })
          let savedHistory;
    
          if(data?.uuid) {
            const DB = await switchDB(req.subdomain, employeeInfoHistorySchema);
            const employeeInfoHistoryModel = await getDBModel(
              DB,
              "employeeInfoHistory"
            );
            const savedHistoryDetail=await employeeInfoHistoryModel.findOne(
              { documentUUID: data.uuid })
            const historyObj = {
              name : "UPDATE",
              updateAt : new Date(),
              historyObject : {
                addressType:data.addressType,
                isActive:data.isActive,
                address1:data.address1,
                address2:data.address2,
                address3:data.address3,
                country:data.country,
                state:data.state,
                city:data.city,
                PIN:data.PIN,
                isPrimary:data.isPrimary,
                file:data.isHistory?data.file:savedHistoryDetail.historyObject?.file
              },
              effectiveDate: data.effectiveDate ?? new Date(),
              reason: data?.reason ?? "Updated Address",
            }
            savedHistory=await employeeInfoHistoryModel.updateOne(
              { documentUUID: data.uuid },
              { $set: historyObj },
              { upsert: false }
            );
          } else {
            // store History
            const history = {
              employeeUUID: data.employeeUUID,
              documentUUID: data?.uuid,
              type: "EmployeeAddress",
              name: "UPDATE",
              historyObject : {
                addressType:data.addressType,
                isActive:data.isActive,
                address1:data.address1,
                address2:data.address2,
                address3:data.address3,
                country:data.country,
                state:data.state,
                city:data.city,
                PIN:data.PIN,
                isPrimary:data.isPrimary,
                file:data.file
            },
              effectiveDate: data.effectiveDate ?? new Date(),
              reason: data?.reason ?? "Updated Address",
              isDeleted: false,
            }
            savedHistory=await EmployeeInfoHistoryService.storeHistory(
              history, req
            );
           }
           return updatedObj;

        } catch (error) {
            console.log(error)
          throw new Error(error);
        }
      }

    delete =  async (query, req, res) => {
        try {
          console.log('Delete Address, Data: ' + JSON.stringify(query))
            const DB = await switchDB(req.subdomain, addressSchema)
            const addressModel = await getDBModel(DB, 'address')
          // find and update record in mongoDB
          //  if it is the only one record and if isPrimary is true  and is updating as a isPrimary then return with the message
          const employeeAddressExist = await addressModel.findOne(query).lean();
          if(employeeAddressExist && employeeAddressExist?.isPrimary ) { 
            return `Can't delete, this is a Primary Address`;
          }
          const employeeInfoHistoryDB = await switchDB(req.subdomain, employeeInfoHistorySchema);
          const employeeInfoHistoryModel = await getDBModel(
            employeeInfoHistoryDB,
            "employeeInfoHistory"
          );
          const historyObj = {
            name :"DELETE",
            reason: "Delete Address",
            isDeleted : true
          }
          await employeeInfoHistoryModel.updateOne(
            { documentUUID: query.uuid },
            { $set: historyObj },
            { upsert: false }
          );
          return await addressModel.findOneAndDelete(query)
        } catch (error) {
            console.log(error)
          throw new Error(error);
        }
      }
      createAllEmployeeAddresses = async (data, req, res) => {
        try {
          let errorList = [];
          let errorCount = 0;
          let sucessList = [];
          let sucessfullyAddedCount = 0;
    
          const allEmployeeAddresses = await this.findAddressById({},req);
    
          //getActiveEmployees
          const employeeDB = await switchDB(req.subdomain, employeeSchema);
          const employeeModel = await getDBModel(employeeDB, "employee");
          const allEmployees = await employeeModel.find().lean();
    
          const employeeAddressSchemaDB = await switchDB(
            req.subdomain,
            addressSchema
          );
          const uploadResultsDB = await switchDB(
            req.subdomain,
            uploadResultsSchema
          );
          const employeeAddressModel = await getDBModel(
            employeeAddressSchemaDB,
            "address"
          );
          const uploadResultsModel = await getDBModel(
            uploadResultsDB,
            "uploadResults"
          );
          const addressTypeList = ["Home", "Hostel", "Permanent", "Temporary"];
          let CSVHeader = [];
          CSVHeader.push(
            { label: "Employee_Id", key: "employeeId" },
            { label: "Address_Type", key: "addressType" },
            { label: "Effective_Date(DD/MM/YYYY)", key: "effectiveDate" },
            { label: "Country", key: "country" },
            { label: "State", key: "state" },
            { label: "City", key: "city" },
            { label: "Pin_Code", key: "PIN" },
            { label: "Address_Line_One", key: "address1" },
            { label: "Address_Line_Two", key: "address2" },
            { label: "Address_Line_Three", key: "address3" },
            { label: "Is_Primary", key: "isPrimary" }
          );
          let uploadingData = {
            type: "EmployeeAddress",
            uploadedBy: "namya",
            fileName: data.fileName,
            errorFileName: data.fileName,
            status: "InProgress",
            uploadedData: data.data,
            createdAt: new Date(),
            csvHeader: CSVHeader,
          };
          const createUploadResult = await uploadResultsModel.insertMany(
            [uploadingData],
            {
              runValidators: true,
            }
          );
          const mappedUploadingData = new Map();
          for (let i = 0; i < data.data?.length > 0; i++) {
            const employeeAddress = data.data[i];
            if (mappedUploadingData.get(employeeAddress.employeeId)) {
              mappedUploadingData.set(employeeAddress.employeeId, [
                ...mappedUploadingData.get(employeeAddress.employeeId),
                {...employeeAddress,index:i},
              ]);
            } else {
              mappedUploadingData.set(employeeAddress.employeeId, [{...employeeAddress,index:i}]);
            }
          }
          const mappedExistingData = new Map();
          for (let i = 0; i < allEmployeeAddresses?.length > 0; i++) {
            const employeeAddress = allEmployeeAddresses[i];
            if (mappedExistingData.get(employeeAddress.employeeId)) {
              mappedExistingData.set(employeeAddress.employeeId, [
                ...mappedExistingData.get(employeeAddress.employeeId),
                employeeAddress,
              ]);
            } else {
              mappedExistingData.set(employeeAddress.employeeId, [employeeAddress]);
            }
          }
          console.log(mappedExistingData);
    
          for (let i = 0; i < data.data?.length > 0; i++) {
            const employeeAddress = data.data[i];
    
            console.log("processing the record: ", i + 1);
            const errors = await employeeAddressUtils.validateEmployeeAddress(
              employeeAddress,
              allEmployees,
              mappedUploadingData,
              mappedExistingData,
              i
            );
            if (errors.length > 0) {
              const errorData = { ...employeeAddress };
              errorData.errors = errors;
              errorList.push(errorData);
              errorCount++;
            } else {
              try {
                const uploadingAddressesListOfEmployee = mappedUploadingData.get(
                  employeeAddress.employeeId
                );
                const existingAddressesListOfEmployee = mappedExistingData
                  ? mappedExistingData.get(employeeAddress.employeeId)
                    ? mappedExistingData.get(employeeAddress.employeeId)
                    : []
                  : [];
                const duplicatePreferredRecordinUploadingData =
                  uploadingAddressesListOfEmployee.filter(
                    (addressData) =>
                      addressData.isPrimary.toLowerCase() ===
                        "true".toLowerCase() && i != addressData.index
                  );
                const notPreferredRecordinUploadingData =
                  uploadingAddressesListOfEmployee.filter(
                    (addressData) =>
                      addressData.isPrimary.toLowerCase() ===
                        "false".toLowerCase()
                  );
                const duplicatePreferredRecordinExistingData =
                  existingAddressesListOfEmployee.filter(
                    (addressData) => addressData.isPrimary
                  );
                console.log(duplicatePreferredRecordinUploadingData);
                console.log(notPreferredRecordinUploadingData);
                console.log(duplicatePreferredRecordinExistingData);
    
                if (
                  employeeAddress.isPrimary.toLowerCase() === "true".toLowerCase()
                ) {
                  if (duplicatePreferredRecordinExistingData.length > 0) {
                    const updatedAddresses = await employeeAddressModel.updateMany(
                      { employeeId: employeeAddress.employeeId, isPrimary: true },
                      { $set: { isPrimary: false } }
                    );
                  }
                } else {
                  if (
                    duplicatePreferredRecordinExistingData.length == 0 &&
                    notPreferredRecordinUploadingData.length ===
                      mappedUploadingData.get(employeeAddress.employeeId).length
                  ) {
                    employeeAddress.isPrimary = "true";
                  }
                }
    
                // if(employeeAddress?.employeeId  && allEmployees?.length>0) {
                //   employeeAddress.employeeId = allEmployees.find(e => e.id == employeeAddress.employeeId)?.uuid
                // }

                const employeeAddressData = {
                  ...employeeAddress,
                };
                employeeAddressData.isPrimary =
                  employeeAddress.isPrimary?.toLowerCase() === "true".toLowerCase();
                  const employeeAddressTypeIndex = addressTypeList.findIndex(
                    (addressType) =>
                    addressType.toLowerCase() == employeeAddress.addressType.toLowerCase()
                  );
                  employeeAddressData.addressType = addressTypeList[employeeAddressTypeIndex];
                const savedEmployeeAddress = await employeeAddressModel.insertMany(
                  [employeeAddressData],
                  { runValidators: true }
                );
                const historyObject= {
                  ...employeeAddressData
                }
                // Strore History
                const history = {
                  employeeUUID: data.employeeUUID,
                  documentUUID: savedEmployeeAddress[0]?.uuid,
                  type: "EmployeeAddress",
                  name: "CREATE",
                  historyObject,
                  effectiveDate: new Date(),
                  reason: "Create new Address",
                  isDeleted: false,
                }
                await EmployeeInfoHistoryService.storeHistory(
                  history, req
                );
    
                if (savedEmployeeAddress.length > 0) {
                  sucessList.push(employeeAddressData);
                  sucessfullyAddedCount++;
                }
              } catch (error) {
                const errorData = { ...employeeAddress };
                errorData.errors = error?.message;
                errorList.push(errorData);
                errorCount++;
                console.log("error occured while saving record", i + 1);
                console.log("err", error);
              }
            }
            console.log("processed record", i + 1);
          }
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

module.exports = new AddressService()