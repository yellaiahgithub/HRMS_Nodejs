const {
  switchDB,
  getDBModel,
  employeeSchema,
  uploadResultsSchema,
  employeeInfoHistorySchema,
  actionSchemas,
  timelineSchemas,
  permissionsSchema,
  probationSetupSchema,
  employeeEmailSchema,
  employeePhoneSchema,
  addressSchema,
  certificateOrlicenseSchema,
  educationSchema,
  emergencyContactSchema,
  employeeDependantOrBeneficiarySchema,
  nationIDSchema,
  workExperienceSchema,
  resignationSchema,
  transactionSummarySchema,
  notificationSchema
  
} = require("../middlewares/switchDB");
const autoNumberingService = require("./autoNumberingService");
const UserIdService = require("../services/useridService.js");
const departmentService = require("../services/departmentService.js");
const designationService = require("../services/designationService.js");
const locationService = require("../services/locationService.js");
const reasonService = require("../services/reasonService.js");
const employeeUtils = require("../utils/employeeUtils");
var moment = require("moment"); // require
const { v4: uuidv4 } = require("uuid");
const StorageService = require("./StorageService");
const permissionService = require("./permissionService");
const conf = require("../conf/conf");
const employeeEmailService = require("./employeeEmailService");
const probationSetupService = require("./probationSetupService");
class EmployeeService {
  constructor() {}

  createEmployee = async (data, req) => {
    try {
      console.log("Data for employee create", data);
      const nextSequence = await autoNumberingService.getNextSequence(
        { type: "EMP" },
        req
      );
      if (nextSequence != null) {
        data.id = nextSequence;
      }
      data.uuid = uuidv4()
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      const employeeHistoryDB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        employeeHistoryDB,
        "employeeInfoHistory"
      );
      const actionDB = await switchDB(companyName, actionSchemas);
      const actionModel = await getDBModel(actionDB, "action");
      const foundAction = await actionModel
        .findOne({
          actionCode:{ $regex: "Hire", '$options': 'i' } ,
          isActive: true,
        })
        .lean();

      // call function for Probation date
      if(data?.jobStatus == "Probation") {
        const probationDate = await probationSetupService.getProbationDate(data, companyName)
        data["probationDate"] = probationDate ?? null
      } else {
        data["probationDate"] = null
      }

      const savedEmployee = await employeeModel.insertMany([data], {
        runValidators: true,
      });
      const namehistoryData={
        employeeUUID:data.uuid,
        uuid:uuidv4(),
        name:"CREATE",
        type:"EmployeeName",
        orderNo:1,
        historyObject:{ firstName:data.firstName,
          lastName:data.lastName,
          middleName:data.middleName
        },
      effectiveDate:new Date(),
      reason: "New Employee Created from hire Page",
      }
      const genderhistoryData={
        employeeUUID:data.uuid,
        uuid:uuidv4(),
        name:"CREATE",
        type:"EmployeeGender",
        orderNo:1,
        historyObject:{ gender: data.gender},
        effectiveDate:new Date(),
        reason: "New Employee Created from hire Page",
      }
      const jobDetailshistoryData={
        employeeUUID:data.uuid,
        uuid:uuidv4(),
        name:"CREATE",
        type:"EmployeeJobDetails",
        orderNo:1,
        historyObject:{ jobType: data.jobType,
          jobStatus: data.jobStatus,
          hireDate: data.hireDate,
          department: data.department,
          location: data.location,
          designation: data.designation,
          managerUUID: data.managerUUID,
          action:foundAction?.actionCode,
          actionReason:data.reasonForHire
        },
      effectiveDate:new Date(),
      reason: "New Employee Created from hire Page",
      }
      const historyData=[namehistoryData,jobDetailshistoryData, genderhistoryData]
      const savedEmployeeInfoHistory = await employeeInfoHistoryModel.insertMany(
        historyData,
        {
          runValidators: true,
        })
      if (nextSequence != null) {
        const temp = await autoNumberingService.updateSequence(
          { type: "EMP" },
          req
        );
      }
      // Store timeline fore HIRE
      const timelineDB = await switchDB(companyName, timelineSchemas);
      const timelineModel = await getDBModel(timelineDB, "timeline");

      await timelineModel.insertMany(
        [{
          incident: "HIRE",
          employeeUUID: data.uuid,
          createdAt: data.hireDate,
          updatedAt: data.hireDate
        }]
      );

      const currentDate = new Date();
      const yearsPassed = currentDate.getFullYear() - new Date(data.hireDate).getFullYear();

      for (let i = 1; i <= yearsPassed; i++) {
        // Calculate the service anniversary date
        const serviceAnniversaryDate = new Date(data.hireDate);
        serviceAnniversaryDate.setFullYear(new Date(data.hireDate).getFullYear() + i);
      
        // Create the record for the service anniversary
        const record = {
          incident: "Service Anniversary",
          employeeUUID: data.uuid,
          createdAt: serviceAnniversaryDate,
          updatedAt: serviceAnniversaryDate
        };
      
        // Insert the record into the timeline collection
        await timelineModel.insertMany([record]);
      }      

      return savedEmployee;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  

  updateEmployee = async (data, req) => {
    try {
      console.log("Data for employee update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");

      // validate ManagerId is not reporting to updatedUser 
      if(data.managerUUID == data.uuid) {
        throw new Error("You can't be your manager");
      }

      if(data.managerUUID) {
        const reportees = await employeeModel.find({managerUUID: data.uuid}, {_id:0,uuid:1}).lean();  
        if(reportees && reportees.find(r =>r?.uuid == data.managerUUID)) {
          throw new Error("Reporter can't be Employee's Manager");
        }
      }

      return await employeeModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      return await employeeModel.find({});
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findOneEmployee = async (query, req) => {
    try {
      console.log("Get employee, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      return await employeeModel.findOne(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmployeesByQuery = async (query, req) => {
    try {
      console.log("Get employee, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      return await employeeModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  generateUserId = async (employee, userIdSetup, req) => {
    if (userIdSetup?.emailId) {
      const emplaoyeeEmail =  await employeeEmailService.findEmployeeEmail({employeeUUID : employee.uuid, type: "Official"}, req)
      if(emplaoyeeEmail[0]?.email) {
        return emplaoyeeEmail[0]?.email;
      } else {
        return `Employee : ${employee.firstName} ${employee.lastName} don't have Official email`
      }
      
    } else if (userIdSetup?.employeeId) {
      return employee.id;
    } else if (userIdSetup?.customUserId) {
      let userId =
        userIdSetup.combination[0].name === "First Name"
          ? employee.firstName.substr(0, userIdSetup.combination[0]?.length) +
            employee.lastName.substr(0, userIdSetup.combination[1]?.length)
          : employee.lastName.substr(0, userIdSetup.combination[1]?.length) +
            employee.firstName.substr(0, userIdSetup.combination[0]?.length);
      return userId?.toUpperCase()?.trim();
    }
  };

  deleteEmployee = async (uuid, req) => {
    try {
      console.log("Delete employeeUUID, Data: " + JSON.stringify(uuid));
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(companyDB, "employee");

      // get Other information about the employee
      const emp =  await employeeModel.deleteOne({ uuid: uuid });
      if(emp) {
        // Delete emaployee Details
        this.deleteEmployeeDetails(uuid, companyName)
      }
      return emp;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  deleteEmployeeDetails = async (uuid, companyName) => {
    // delete Emails
    const companyDB =  await switchDB(companyName, employeeEmailSchema);
    const employeeEmailModel =  await getDBModel(companyDB, "employeeEmail");
    await employeeEmailModel.deleteMany({employeeUUID : uuid});
      
    // delete phonenumbers
    const pDB = await switchDB(companyName, employeePhoneSchema);
    const employeePhoneModel =  await getDBModel(pDB, "employeePhone");
    await employeePhoneModel.deleteMany({employeeUUID : uuid});

    // delete Address
    const aDB =  await switchDB(companyName, addressSchema);
    const addressModel = await getDBModel(aDB, "address");
    await addressModel.deleteMany({employeeUUID : uuid});

    // delete certificateOrlicense
    const clDB = await switchDB(companyName, certificateOrlicenseSchema);
    const clModel = await getDBModel(clDB, "certificateOrlicense");
    await clModel.deleteMany({employeeUUID : uuid});

    // delete educations
    const eDB = await switchDB(companyName, educationSchema);
    const eModel = await getDBModel(eDB, "education");
    await eModel.deleteMany({employeeUUID : uuid});

    // delete emergencyContact
    const ecDB = await switchDB(companyName, emergencyContactSchema);
    const ecModel = await getDBModel(ecDB, "emergencyContact");
    await ecModel.deleteMany({employeeUUID : uuid});

    // delete employeeDependantOrBeneficiary
    const depbDB = await switchDB(companyName, employeeDependantOrBeneficiarySchema);
    const depBenModel = await getDBModel(depbDB, "employeeDependantOrBeneficiary");
    await depBenModel.deleteMany({employeeUUID : uuid});

    // delete nationID
    const nDB = await switchDB(companyName, nationIDSchema)
      const nationIDModel = await getDBModel(nDB, 'nationID')
    await nationIDModel.deleteMany({employeeUUID : uuid});

    // delete work-experience
    const wDB = await switchDB(companyName, workExperienceSchema);
    const wModel = await getDBModel(wDB, "workExperience");
    await wModel.deleteMany({employeeUUID : uuid});

    //history,
    const hDB = await switchDB(companyName, employeeInfoHistorySchema);
    const hModel = await getDBModel(hDB, "employeeInfoHistory");
    await hModel.deleteMany({employeeUUID : uuid});

    //timeline
    const tDB = await switchDB(companyName, timelineSchemas);
    const tModel = await getDBModel(tDB, "timeline");
    await tModel.deleteMany({employeeUUID : uuid});

    //resignation
    const rDB = await switchDB(companyName, resignationSchema);
    const rModel = await getDBModel(rDB, "resignation");
    await rModel.deleteMany({employeeUUID : uuid});

    //transactions
    const transDB = await switchDB(companyName, transactionSummarySchema);
    const transModel = await getDBModel(transDB, "transactionSummary");
    await transModel.deleteMany({employeeUUID : uuid});

    //notification
    const notificationDB = await switchDB(companyName, notificationSchema);
    const notificationModel = await getDBModel(notificationDB, "notification");
    await notificationModel.deleteMany({employeeUUID : uuid});
  }


  assignRoleToEmployees = async (data, req) => {
    try {
      console.log("Data for employee update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      return await employeeModel.update(
        { uuid: data.employeeUUIDs },
        { $addToSet: { roleUUIDs: data.roleUUID } },
        { upsert: false }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  unAssigRoleToEmployees = async (data, req) => {
    try {
      console.log("Data for employee update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      return await employeeModel.updateMany(
        { uuid: data.employeeUUIDs, roleUUIDs: data.roleUUID },
        { $pull: { roleUUIDs: data.roleUUID } },
        { upsert: false }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmployeesAgg = async (pipeline, req) => {
    try {
      console.log("Get employee, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      return await employeeModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findMultipleEmployees = async (pipeline, req) => {
    try {
      console.log("Get employee, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      return await employeeModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmployeeDetails = async (matchCondition, req, res) => {
    let pipeline = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: "department",
          localField: "department",
          foreignField: "id",
          as: "departmentData",
        },
      },
      {
        $unwind: {
          path: "$departmentData",
          preserveNullAndEmptyArrays: true,
        },
      },
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
      {
        $lookup: {
          from: "locations",
          localField: "location",
          foreignField: "locationId",
          as: "locationData",
        },
      },
      {
        $unwind: {
          path: "$locationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employee",
          localField: "managerUUID",
          foreignField: "uuid",
          as: "managerData",
        },
      },
      {
        $unwind: {
          path: "$managerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "reasons",
          localField: "reasonForHire",
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
        $lookup: {
          from: "employeeEmail",
          localField: "uuid",
          foreignField: "employeeUUID",
          as: "emailData",
        },
      },
      {
        $lookup: {
          from: "employeePhone",
          localField: "uuid",
          foreignField: "employeeUUID",
          as: "phoneData",
        },
      },
      {
        $lookup: {
          from: "address",
          localField: "uuid",
          foreignField: "employeeUUID",
          pipeline:[
            {
              $match:{
                isPrimary:true,
                isActive:true
              }
            }
          ],
          as: "primaryAddress",
        },
      },
      {
        $unwind: {
          path: "$primaryAddress",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleUUIDs",
          foreignField: "uuid",
          as: "roles",
        },
      },
      {
        $project: {
          _id: 1,
          uuid: 1,
          id: "$id",
          legalName: {
            $concat: [
              "$firstName",
              " ",
              { $ifNull: ["$middleName", " "] },
              "$lastName",
            ],
          },
          department: "$department",
          location: "$location",
          designation: "$designation",
          managerUUID: "$managerUUID",
          reasonForHire: "$reasonForHire",
          departmentName: "$departmentData.name",
          locationName: "$locationData.locationName",
          designationName: "$designationData.name",
          reasonForHireName: "$reasonData.reasonName",
          managerName: {
            $concat: [
              "$managerData.firstName",
              " ",
              { $ifNull: ["$managerData.middleName", " "] },
              "$managerData.lastName",
            ],
          },
          firstName: "$firstName",
          middleName: "$middleName",
          lastName: "$lastName",
          jobType: "$jobType",
          jobStatus: "$jobStatus",
          fatherOrHusband: "$fatherOrHusband",
          fatherOrHusbandName: "$fatherOrHusbandName",
          dob: "$dob",
          age: "$age",
          celebratesOn: "$celebratesOn",
          birthCountry: "$birthCountry",
          birthPlace: "$birthPlace",
          birthState: "$birthState",
          bloodGroup: "$bloodGroup",
          nationality: "$nationality",
          maritalStatus: "$maritalStatus",
          isActive: "$isActive",
          gender: "$gender",
          hireDate: "$hireDate",
          userId: "$userId",
          roleUUIDs: "$roleUUIDs",
          emails: "$emailData",
          phones: "$phoneData",
          file: "$file",
          createdAt:"$createdAt",
          updatedAt:"$updatedAt",
          roles: "$roles",
          primaryAddress:{$ifNull: ["$primaryAddress", null]}
        },
      },
    ];
    try {
      console.log("Get employee, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(DB, "employee");
      const user = await employeeModel.aggregate(pipeline);
      if(user && user[0]?.roles) {
        let allPermissionUUIDs = user[0].roles.map(x =>x?.permissions)
        allPermissionUUIDs = [...new Set([].concat(...allPermissionUUIDs))];

        let pipeline = [
          {
            $match: {
              uuid  : {$in:  allPermissionUUIDs}
            }
          },
          {
            $project: {
              _id:0,
              name:1,
              id:1
            }
          }
        ]

        user[0].permissions = await permissionService.findPermissionById(pipeline)
      }
      for(let index=0;index<user.length;index++){
        const empDetails=user[index];
        if(empDetails.file){
          let storageResp = await StorageService.get(empDetails.file.filePath+'/'+empDetails.file.fileName);
          if (typeof storageResp != 'string') {
            let buf = Buffer.from(storageResp.Body);
            let base64 = buf.toString("base64");
            let imgSrc64 = 'data:image/jpg;base64,' + base64;
            empDetails.profilePic=imgSrc64
          }  
        }
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  createAllEmployee = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      
      const allDepartments = await departmentService.findAll(req);
      const allLocations = await locationService.findAll(
        { status: true },
        req,
        res
      );
      const allDesignations = await designationService.findAllDesignationsByCondition(
        {
          status: true,
        },
        req
      );
      const allEmployees = await this.findEmployeesByQuery(
        {
          isActive: true,
        },
        req
      );
      const allReasons = await reasonService.findAll(
        {
          isActive: true,
        },
        req
      );
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const employeeModel = await getDBModel(employeeDB, "employee");
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      const employeeHistoryDB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        employeeHistoryDB,
        "employeeInfoHistory"
      );
      const actionDB = await switchDB(companyName, actionSchemas);
      const actionModel = await getDBModel(actionDB, "action");
      const foundAction = await actionModel
        .findOne({
          actionCode:{ $regex: "Hire", '$options': 'i' } ,
          isActive: true,
        })
        .lean();
      let CSVHeader = [];
      if (!data?.isAutoGeneratedEmployeeId) {
        CSVHeader.push({ label: "Employee_Id", key: "emploayeeId" });
      }
      CSVHeader.push(
        { label: "Legal_First_Name", key: "firstName" },
        { label: "Legal_Middle_Name", key: "middleName" },
        { label: "Legal_Last_Name", key: "lastName" },
        { label: "Job_Type", key: "jobType" },
        { label: "Job_Status", key: "jobStatus" },
        { label: "FatherOrHusband", key: "fatherOrHusband" },
        { label: "FatherOrHusband_Name", key: "fatherOrHusbandName" },
        { label: "Date_Of_Birth", key: "dob" },
        { label: "Celebrates_On", key: "celebratesOn" },
        { label: "Birth_Country", key: "birthCountry" },
        { label: "Birth_State", key: "birthState" },
        { label: "Place_Of_Birth", key: "birthPlace" },
        { label: "Gender", key: "gender" },
        { label: "Marital_Status", key: "maritalStatus" },
        { label: "Hire_Date", key: "hireDate" },
        { label: "Hire_Reason", key: "reasonForHire" },
        { label: "Nationality", key: "nationality" },
        { label: "Employee_Department", key: "department" },
        { label: "Employee_Location", key: "location" },
        { label: "Employee_Designation", key: "designation" },
        { label: "Manager_ID", key: "managerUUID" },
      );
      let createUploadResult =  []
      if(data.forValidationOnly == false) {
        let uploadingData = {
          type: "Employee",
          uploadedBy: "namya",
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
        const employee = data.data[i];
       
        const employeeData = {
          ...employee,
          status: true,
        };

        if (data?.isAutoGeneratedEmployeeId) {
          const nextSequence = await autoNumberingService.getNextSequence(
            { type: "EMP" },
            req,
            res
          );
          if (nextSequence != null) {
            employeeData.id = nextSequence;
            employee.id = nextSequence;
          }
        }

        console.log("processing the record: ", i + 1);
         const errors = await employeeUtils.validateEmployee(
          employee,
          data.data,
          data?.isAutoGeneratedEmployeeId,
          allDepartments,
          allLocations,
          allDesignations,
          allEmployees,
          allReasons
        );
        if (errors.length > 0) {
          const errorData = { ...employee };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            employeeData["dob"] = new Date(
              moment(employee.dob, "DD/MM/YYYY")
            );
            employeeData["celebratesOn"] = new Date(
              moment(employee.celebratesOn, "DD/MM/YYYY")
            );
            
            if(employeeData?.managerUUID && allEmployees?.length>0) {
              employeeData.managerUUID = allEmployees.find(e => e.id == employeeData.managerUUID)?.uuid
            }
            if(data.forValidationOnly == false) {
              const savedEmployee = await employeeModel.insertMany(
                [employeeData],
                { runValidators: true }
              );
              const namehistoryData={
                employeeUUID:savedEmployee.uuid,
                uuid:uuidv4(),
                name:"CREATE",
                type:"EmployeeName",
                orderNo:1,
                historyObject:{ firstName:employeeData.firstName,
                  lastName:employeeData.lastName,
                  middleName:employeeData.middleName
                },
              effectiveDate:new Date(),
              reason: "New Employee Created from employee Bulk Upload",
              }
              const genderhistoryData={
                employeeUUID:savedEmployee.uuid,
                uuid:uuidv4(),
                name:"CREATE",
                type:"EmployeeGender",
                orderNo:1,
                historyObject:{ gender: employeeData.gender },
                effectiveDate:new Date(),
                reason: "New Employee Created from employee Bulk Upload",
              }
              const jobDetailshistoryData={
                employeeUUID:savedEmployee.uuid,
                uuid:uuidv4(),
                name:"CREATE",
                type:"EmployeeJobDetails",
                orderNo:1,
                historyObject:{ 
                  jobType: employeeData.jobType,
                  jobStatus: employeeData.jobStatus,
                  hireDate: employeeData.hireDate,
                  department: employeeData.department,
                  location: employeeData.location,
                  designation: employeeData.designation,
                  managerUUID: employeeData.managerUUID,
                  action:foundAction?.actionCode,
                  actionReason:reasonForHire
                },
              effectiveDate:new Date(),
              reason: "New Employee Created from employee Bulk Upload",
              }
              const historyData=[namehistoryData,jobDetailshistoryData, genderhistoryData]
              const savedEmployeeInfoHistory = await employeeInfoHistoryModel.insertMany(
                historyData,
                {
                  runValidators: true,
                })
              if (savedEmployee.length > 0) {
                if (data?.isAutoGeneratedEmployeeId) {
                  const temp = await autoNumberingService.updateSequence(
                    { type: "EMP" },
                    req,
                    res
                  );
                }
                sucessList.push(employeeData);
                sucessfullyAddedCount++;
              }
            } else {
                const errorData = { ...employeeData };
                errorData.errors = [];
                errorList.push(errorData);
            }
            
          } catch (error) {
            const errorData = { ...employee };
            errorData.errors = error.errors?.code?.properties?.message;
            errorList.push(errorData);
            errorCount++;
            console.log("error occured while saving record", i + 1);
            console.log("err", error);
          }
          
        }
        console.log("processed record", i + 1);
      }
      
      if(data.forValidationOnly == false && createUploadResult?.length >0) {
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

  updateAllEmployee = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      const companyName = req.subdomain
      const allEmployees = await this.findEmployeesByQuery(
        {
          isActive: true,
        },
        req
      );
      const allReasons = await reasonService.findAll(
        {
          isActive: true,
        },
        req
      );

      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      const employeeHistoryDB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        employeeHistoryDB,
        "employeeInfoHistory"
      );
      const actionDB = await switchDB(companyName, actionSchemas);
      const actionModel = await getDBModel(actionDB, "action");
      const AllActions = await actionModel.find({isActive: true}).lean();

      let CSVHeader = [];
      
      CSVHeader.push();
      
      CSVHeader.push(
        { label: "Employee_Id", key: "employeeId" },
        { label: "Action", key: "actionCode" },
        { label: "Action_Reason", key: "actionReason" },
        { label: "Effective_Date", key: "effectiveDate" },
        { label: "Manager_ID", key: "managerId" },
      );
      let createUploadResult =  []
      if(data.forValidationOnly == false) {
        let uploadingData = {
          type: "Employee",
          uploadedBy: req.subdomain,
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
        const employee = data.data[i];
       
        const employeeData = {
          ...employee,
        };

        console.log("processing the record: ", i + 1);
         const errors = await employeeUtils.validateEmployeeManager(
          employee,
          allEmployees,
          allReasons,
          AllActions
        );
        if (errors.length > 0) {
          const errorData = { ...employee };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
           
            if(data.forValidationOnly == false) {
              if(employeeData?.managerId && allEmployees?.length>0) {
                employeeData.managerUUID = allEmployees.find(e => e.id == employeeData.managerId)?.uuid
              }
              let employeeRecord = {};
              if(employeeData?.employeeId && allEmployees?.length>0) {
                employeeRecord = allEmployees.find(e => e.id == employeeData.employeeId)
                employeeData.employeeUUID = allEmployees.find(e => e.id == employeeData.employeeId)?.uuid
              }
                const savedEmployee = await employeeModel.updateOne(
                  { id : employeeData.employeeId },
                  {
                    $set: {
                      managerUUID : employeeData.managerUUID,
                      updatedAt: new Date(),
                    },
                  },
                  { upsert: false, runValidators: true }
                );
                const existingRecords = await employeeInfoHistoryModel.find({
                  type: "EmployeeJobDetails",
                  employeeUUID: employeeData.employeeUUID,
                });
                const jobDetailshistoryData={
                  employeeUUID:employeeData.employeeUUID,
                  uuid: uuidv4(),
                  name: "CREATE",
                  type: "EmployeeJobDetails",
                  orderNo: existingRecords.length + 1,
                  historyObject:{ 
                    jobType: employeeRecord.jobType,
                    jobStatus: employeeRecord.jobStatus,
                    hireDate: employeeRecord.hireDate,
                    department: employeeRecord.department,
                    location: employeeRecord.location,
                    designation: employeeRecord.designation,
                    managerUUID: employeeData.managerUUID,
                    action:employeeData?.actionCode,
                    actionReason:employeeData?.actionReason,
                  },
                  effectiveDate:  new Date(),
                  reason: "Update Employee Manager from employee Upload Manager Change",
                }
                
                const savedEmployeeInfoHistory = await employeeInfoHistoryModel.insertMany(
                  jobDetailshistoryData,
                  {
                    runValidators: true,
                  })
                if (savedEmployee.modifiedCount > 0) {
                  sucessList.push(employeeData);
                  sucessfullyAddedCount++;
                }
            } else {
                const errorData = { ...employeeData };
                errorData.errors = [];
                errorList.push(errorData);
            }
            
          } catch (error) {
            const errorData = { ...employee };
            errorData.errors = error.errors?.code?.properties?.message;
            errorList.push(errorData);
            errorCount++;
            console.log("error occured while saving record", i + 1);
            console.log("err", error);
          }
          
        }
        console.log("processed record", i + 1);
      }
      
      if(data.forValidationOnly == false && createUploadResult?.length >0) {
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


  findUserTeamByUUID = async (employeeUUID,managerUUID, req) => {
    try {
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");

      const result = await employeeModel.aggregate(
        [
            {
              $match: {
                isActive: true,
                $or: [
                  {
                    uuid: {
                      $eq: employeeUUID
                    }
                  },
                  {
                    uuid:{$eq:managerUUID}
                  },
                  {
                    managerUUID: {
                      $eq: employeeUUID
                    }
                  }
                ]
              }
            },
            {
              $lookup: {
                from: "department",
                localField: "department",
                foreignField: "id",
                as: "departmentData",
              },
            },
            {
              $unwind: {
                path: "$departmentData",
                preserveNullAndEmptyArrays: true,
              },
            },
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
            {
              $lookup: {
                from: "locations",
                localField: "location",
                foreignField: "locationId",
                as: "locationData",
              },
            },
            {
              $unwind: {
                path: "$locationData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                uuid: 1.0,
                id: 1.0,
                firstName: 1.0,
                lastName: 1.0,
                managerUUID: 1.0,
                file: 1.0,
                location: {
                  $ifNull: [
                    "$locationData.locationName",
                    "$location",
                  ],
                },
                designation: {
                  $ifNull: [
                    "$designationData.name",
                    "$designation",
                  ],
                },
                department: {
                  $ifNull: ["$departmentData.name", "$department"],
                },
              }
            },
            {
              $graphLookup: {
                from: 'employee',
                startWith: '$uuid',
                connectFromField: 'uuid',
                connectToField: 'managerUUID',
                as: 'all_reports',
                'maxDepth': 0, 
			          'depthField': 'level',
                restrictSearchWithMatch:{
                isActive: true
               }
              }
            },
            {
              $set: {
                children: {
                  $size: '$all_reports'
                }
              }
            },
            {
              $unwind: {
                path: '$all_reports',
                preserveNullAndEmptyArrays: true
              }
            },
            
            
            {
              $group: {
                _id: {
                  uuid: '$uuid',
                  id: '$id',
                  firstName: '$firstName',
                  lastName: '$lastName',
                  managerUUID: '$managerUUID',
                  file: "$file",
                  children: '$children',
                  location: {
                    $ifNull: [
                      "$locationData.locationName",
                      "$location",
                    ],
                  },
                  designation: {
                    $ifNull: [
                      "$designationData.name",
                      "$designation",
                    ],
                  },
                  department: {
                    $ifNull: ["$departmentData.name", "$department"],
                  },
                },
              }
            },
            {
              $project: {
                _id: 0.0,
                uuid: '$_id.uuid',
                id: '$_id.id',
                firstName: '$_id.firstName',
                lastName: '$_id.lastName',
                managerUUID: '$_id.managerUUID',
                file: '$_id.file',
                children: '$_id.children',
                location: {
                  $ifNull: [
                    "$_id.locationData.locationName",
                    "$_id.location",
                  ],
                },
                designation: {
                  $ifNull: [
                    "$_id.designationData.name",
                    "$_id.designation",
                  ],
                },
                department: {
                  $ifNull: ["$_id.departmentData.name", "$_id.department"],
                },
              }
            },
            {
              $sort: {
                id:1
              }
            }
          ]
        )
      
      if(result?.length>0) {
      for(let index=0;index<result.length;index++){
          const empDetails=result[index];
          if(empDetails.file){
            let storageResp = await StorageService.get(empDetails.file.filePath+'/'+empDetails.file.fileName);
            if (typeof storageResp != 'string') {
              let buf = Buffer.from(storageResp.Body);
              let base64 = buf.toString("base64");
              let imgSrc64 = 'data:image/jpg;base64,' + base64;
              empDetails.profilePic=imgSrc64
            }
          }
        }
      }
      return result;
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }

  updateProbationConfirmation = async(data, req) => {
    try {
      const companyName = req.subdomain;

      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");

      const employeeHistoryDB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        employeeHistoryDB,
        "employeeInfoHistory"
      );

      // To update employees jobStatus to Confirmed
      await employeeModel.updateMany({ uuid: {$in: data.employeeUUIDs} }, 
        {
          $set: {
            jobStatus: "Confirmed",
            updatedAt: new Date(),
            confirmationDate: data.confirmationDate
          },
        },
        { upsert: false, runValidators: true }
      )

      for(let i=0; i<data.employeeUUIDs.length; i++) {
        const employee = await employeeModel.findOne({ uuid: data.employeeUUIDs[i]}).lean();
        const existingRecords = await employeeInfoHistoryModel.find({
          type: "EmployeeJobDetails",
          employeeUUID: employee.uuid,
        });
        const jobDetailshistoryData={
          employeeUUID: employee.uuid,
          uuid: uuidv4(),
          name: "CREATE",
          type: "EmployeeJobDetails",
          orderNo: existingRecords.length + 1,
          historyObject:{ 
            jobType: employee.jobType,
            jobStatus: "Confirmed",
            hireDate: employee.hireDate,
            department: employee.department,
            location: employee.location,
            designation: employee.designation,
            managerUUID: employee.managerUUID,
            action: "DTA",
            actionReason: "PBC"
          },
          effectiveDate: data.confirmationDate,
          reason: "Probation Confirmation",
        }
        
        await employeeInfoHistoryModel.insertMany(
          [jobDetailshistoryData],
          {
            runValidators: true,
          })
      }
      return data
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  fetchAttrition = async (req, res, next) => {
    try {
      let data = req.body;
      // const startEndDates = this.getStartEndDates(new Date(data.startDate), new Date(data.endDate), data.frequency);
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const frequency =  data.frequency;

      const matchConditions = {
        type: "EmployeeJobDetails",
        reason: "SEP005",
        isDeleted: false,
      };

      let pipeline = [];

      pipeline.push({ $match: matchConditions });

      if (frequency === "month" || frequency === "year" || frequency === "quarter") {
        const startEndDates = this.getStartEndDates(startDate, endDate, frequency);

        startEndDates.forEach(({ startDate, endDate }) => {
          const matchStage = {
            $match: {
              ...matchConditions,
              effectiveDate: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          };

          // month frequency
          if (frequency === "month") {
            const groupStage = {
              $group: {
                _id: {
                  month: { $month: "$effectiveDate" },
                  year: { $year: "$effectiveDate" },
                },
                startDateEmployeeCount: {
                  $sum: {
                    $cond: [
                      { 
                        $and: [
                          {
                            $gte: [
                              { $toDate: "$effectiveDate" },
                              { $toDate: new Date(startDate) }
                            ]
                          },
                          {
                            $lt: [
                              { $toDate: "$effectiveDate" },
                              {
                                $toDate: {
                                  $add: [
                                    { $toDate: new Date(startDate) },
                                    24 * 60 * 60 * 1000 
                                  ]
                                }
                              }
                            ]
                          }
                        ]
                      },
                      1,
                      0,
                    ],
                  },
                },
                endDateEmployeeCount: {
                  $sum: {
                    $cond: [
                      { 
                        $and: [
                          {
                            $gte: [
                              { $toDate: "$effectiveDate" },
                              { $toDate: new Date(endDate) }
                            ]
                          },
                          {
                            $lt: [
                              { $toDate: "$effectiveDate" },
                              {
                                $toDate: {
                                  $add: [
                                    { $toDate: new Date(endDate) },
                                    24 * 60 * 60 * 1000 
                                  ]
                                }
                              }
                            ]
                          }
                        ]
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            };

            pipeline.push(matchStage, groupStage);
          }
          // year frequency
          else if (frequency === "year") {
            const groupStage = {
              $group: {
                _id: {
                  year: { $year: "$effectiveDate" },
                },
                startDateEmployeeCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$effectiveDate", new Date(startDate)] },
                      1,
                      0,
                    ],
                  },
                },
                endDateEmployeeCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$effectiveDate", new Date(endDate)] },
                      1,
                      0,
                    ],
                  },
                },
              },
            };

            pipeline.push(matchStage, groupStage);
          }
          // quarter frequency
          else if (frequency === "quarter") {
            const addFieldsStage = {
              $addFields: {
                quarter: {
                  $cond: [
                    { $lte: [{ $month: "$effectiveDate" }, 3] },
                    1,
                    {
                      $cond: [
                        { $lte: [{ $month: "$effectiveDate" }, 6] },
                        2,
                        { $cond: [{ $lte: [{ $month: "$effectiveDate" }, 9] }, 3, 4] },
                      ],
                    },
                  ],
                },
              },
            };

            const groupStage = {
              $group: {
                _id: {
                  quarter: "$quarter",
                  year: { $year: "$effectiveDate" },
                },
                startDateEmployeeCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$effectiveDate", new Date(startDate)] },
                      1,
                      0,
                    ],
                  },
                },
                endDateEmployeeCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$effectiveDate", new Date(endDate)] },
                      1,
                      0,
                    ],
                  },
                },
              },
            };

            pipeline.push(matchStage, addFieldsStage, groupStage);
          }
        });
      }

      pipeline.push({
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          startDateEmployeeCount: 1,
          endDateEmployeeCount: 1,
        },
      });

      console.log(pipeline);
      // const companyName = req.subdomain;
      // const DB = await switchDB(companyName, employeeInfoHistorySchema);
      // const employeeInfoHistoryModel = await getDBModel(
      //   DB,
      //   "employeeInfoHistory"
      // );
      // let resp = await employeeInfoHistoryModel.aggregate(pipeline)
      return res.status(200).send(pipeline);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }

  getStartEndDates= async (startDate, endDate, frequency) => {
    const startEndDates = [];
  
    if (frequency === "quarter") {
      const quarters = [
        { startMonth: 1, endMonth: 3 },
        { startMonth: 4, endMonth: 6 },
        { startMonth: 7, endMonth: 9 },
        { startMonth: 10, endMonth: 12 },
      ];
  
      for (let i = 0; i < quarters.length; i++) {
        const startMonth = quarters[i].startMonth;
        const endMonth = quarters[i].endMonth;
  
        const startDateOfMonth = new Date(startDate.getFullYear(), startMonth - 1, 1);
        const endDateOfMonth = new Date(endDate.getFullYear(), endMonth - 1, this.getDaysInMonth(endDate.getFullYear(), endMonth));
  
        if (startDateOfMonth.getMonth() + 1 >= startDate.getMonth() + 1 && endDateOfMonth.getMonth() + 1 <= endDate.getMonth() + 1) {
          startDateOfMonth.setTime(0)
          endDateOfMonth.setTime(0)
          startEndDates.push({ startDate: startDateOfMonth, endDate: endDateOfMonth });
        }
      }
    } else if (frequency === "month") {
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endMonth = endDate.getMonth() + 1;
  
      for (let year = startYear; year <= endYear; year++) {
        let monthStart = 1;
        let monthEnd = 12;
  
        if (year === startYear) {
          monthStart = startMonth;
        }
  
        if (year === endYear) {
          monthEnd = endMonth;
        }
  
        for (let month = monthStart; month <= monthEnd; month++) {
          const startDateOfMonth = new Date(year, month - 1, 1);
          const endDateOfMonth = new Date(year, month - 1, this.getDaysInMonth(year, month));
         
          startEndDates.push({ startDate: startDateOfMonth, endDate: endDateOfMonth });
        }
      }
    } else if (frequency === "year") {
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
  
      for (let year = startYear; year <= endYear; year++) {
        const startDateOfYear = new Date(year, 0, 1);
        
        const endDateOfYear = new Date(year, 11, 31);
        startDateOfYear.setTime(0)
        endDateOfYear.setTime(0)
  
        startEndDates.push({ startDate: startDateOfYear, endDate: endDateOfYear });
      }
    }
  
    return startEndDates;
  }
  
  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  } 
  
}

module.exports = new EmployeeService();
