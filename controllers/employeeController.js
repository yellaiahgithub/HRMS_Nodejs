const EmployeeService = require("../services/employeeService");
const UserIdService = require("../services/useridService.js");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const authService = require("../services/authService");
const companyService = require("../services/companyService");
const orgChartSetupService = require("../services/orgChartSetupService");
const autoNumberingService = require("../services/autoNumberingService");
const downloadResultsService = require("../services/downloadResultsService");
const StorageService = require("../services/StorageService");
const { CURRENT_TIME_ZONE } = require("../conf/conf");
// const CURRENT_TIME_ZONE=Intl.DateTimeFormat().resolvedOptions().timeZone
const {
  switchDB,
  getDBModel,
  actionSchemas,
  employeeInfoHistorySchema,
  probationControlSetupSchema,
} = require("../middlewares/switchDB");
const commonUtils = require("../utils/commonUtils");
const { generateMail } = require("../utils/mailNotificationUtils");
const { MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");

class Employee {
  constructor() {}

  findEmployeeById = async (req, res, next) => {
    try {
      if (!req.params.id) throw new Error("Employee id is required.");
      let query = { id: req.params.id };
      // call method to service
      let pipeline = [
        {
          $match: {
            ...query
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
          $lookup: {
            from: "employees",
            localField: "managerUUID",
            foreignField: "id",
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
          $project:{
            
                  "_id": 1,
                  "id": 1,
                  employeeName: {
                    $concat: ["$firstName", " ", "$lastName"],
                  },
                  "jobType": 1,
                  "jobStatus": 1,
                  "fatherOrHusbandName": 1,
                  "dob": 1,
                  "celebratesOn": 1,
                  "gender":1,
                  "hireDate": 1,
                  "reasonForHire": 1,
                  "department": 1,
                  "location": 1,
                  "designation": 1,
                  "managerUUID": 1,
                  "managerName": {
                    $concat: ["$managerData.firstName", " ", "$managerData.lastName"],
                  },
                  "uuid": 1,
                  "userId": 1,
                  "roleUUIDs": 1,
                  department: {
                    $ifNull: [
                      "$departmentData.name",
                      "$department",
                    ],
                  },
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
                  file: "$file",

          
          }
        }
      ]
      // call method to service
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);
      //let result = await EmployeeService.findOneEmployee(query, req);
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
      if (!result) {
        return res.status(404).send("Employee not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findEmployeeDetails = async (req, res, next) => {
    try {
      let match = {};
      if (req.query?.id) {
        match = { id: { $eq: req.query.id } };
      }
      if (req.query?.userId) {
        match = { ...match, userId: { $eq: req.query.userId } };
      }
      if (req.query?.isActive) {
        match = {
          ...match,
          isActive: req.query.isActive?.toLowerCase() == "true".toLowerCase(),
        };
      }
      if (req.query?.uuid) {
        match = { ...match, uuid: { $eq: req.query.uuid } };
      }
      console.log(match);
      // call method to service
      let result = [];
      if(req.query.isLite&&req.query.isLite=='true'){
        result = await EmployeeService.findEmployeesByQuery(match,req);
      }
      else{
        result = await EmployeeService.findEmployeeDetails(match, req, res);
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  
  findEmployeesWithOutUserIds = async (req, res, next) => {
    try {
      let pipeline = [
        {
          $match: {
            userId: {
              $in: ["", null, "NaN"]
            }
          },
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
            _id: 0,
            uuid: 1,
            employeeID: "$id",
            employeeName: {
              $concat: ["$firstName", " ", "$lastName"],
            },
            department: {
              $ifNull: ["$departmentData.name", "$department"],
            },
            location: {
              $ifNull: ["$locationData.locationName", "$location"],
            },
            designation: {
              $ifNull: ["$designationData.name", "$designation"],
            },
          },
        },
      ];
      // call method to service
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  generateUserIds = async (req, res, next) => {
    try {
      if (req.body?.employeeIds.length <= 0)
        throw new Error("Please Send list of EmployeeIds to generate userIds");
      let userIdSetup = await UserIdService.findAll({}, req);
      let errorArray = [];
      for (let i = 0; i < req.body.employeeIds.length; i++) {
        let employeeId = req.body.employeeIds[i];
        let employee = await EmployeeService.findOneEmployee(
          { uuid: employeeId },
          req
        );
        if (employee) {
          let userId = await EmployeeService.generateUserId(
            employee,
            userIdSetup?.[0],
            req
          );
          if(userId?.includes("don't have Official email")) {
            errorArray.push(userId)
          } else {
            let existingEmployees = await EmployeeService.findEmployeesByQuery(
              { userId: userId },
              req
            );
            if (existingEmployees && existingEmployees.length > 0) {
              userId = userId + existingEmployees.length + i;
            }
            console.log("userId", userId);
            employee.userId = userId;
            await EmployeeService.updateEmployee(employee, req);
            employee.autoGeneratedPassword = true;
            await authService.resetPassword(employee, req, res)
            //send mail
            const inputObj=employee
            const body={benefactorUUIDs:[employee.uuid],initiatorUUID:res.locals.session?.userUUID}
            generateMail(MAIL_NOTIFICATION_TYPE.CREATE_USER_ID,body,req,inputObj)

            // .toString()
            // .split("=")[0];
          }
        }
      }
      if(errorArray?.length) {
        return res.status(200).send("Some Employee's UserID Created successfully and some employees don't have an official email" + errorArray);
      }
      return res.status(200).send("UserID Created successfully");
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  fetchEmployeeCredentialStatus = async (req, res, next) => {
    try {
      if (req.body?.employeeIds.length == 0)
      throw new Error("Please Send list of EmployeeIds to Check User Credential Status");
      let employeeIds = req.body.employeeIds;
      let pipeline = [
        {
          $match: {
            uuid: {
              $in: employeeIds
            }
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
            _id: 0,
            uuid: 1,
            employeeID: "$id",
            jobStatus : 1,
            hireDate : 1,
            isActive: 1,
            employeeName: {
              $concat: ["$firstName", " ", "$lastName"],
            },
            department: {
              $ifNull: ["$departmentData.name", "$department"],
            },
            location: {
              $ifNull: ["$locationData.locationName", "$location"],
            },
            designation: {
              $ifNull: ["$designationData.name", "$designation"],
            },
            credentialStatus: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$isActive", false] },
                    then: "Inactive Employee"
                  },
                  {
                    case: {
                      $or: [
                        { $eq: ["$userId", null] },
                        { $not: "$userId" }
                      ]
                    },
                    then: "To Be Created"
                  },
                  {
                    case: { $ne: ["$userId", null] },
                    then: "Already Created"
                  }
                ],
                default: null
              }
            }
          }
        }
      ]
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);

      if (!result) {
        return res.status(404).send("Employee not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }

  getEmployeeDetail = async (req, res, next) => {
    try {
      console.log("Find Employee, Data By: " + JSON.stringify(req.query));
      if (!req.query.uuid) throw new Error("Employee uuid is required.");
      let query = { uuid: req.query.uuid };

      // call method to service
      let pipeline = [
        {
          $match: query
        },
        {
          $lookup: {
            from: "designation",
            localField: "designation",
            foreignField: "id",
            pipeline: [
              {
                $lookup: {
                  from: "jobGrade",
                  localField: "jobGrade",
                  foreignField: "gradeId",
                  as:"jobGradeData"
                }
              },
              {
                $unwind: {
                  path: "$jobGradeData",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "jobBand",
                  localField: "jobLevel",
                  foreignField: "bandId",
                  as:"jobBandData"
                }
              },
              {
                $unwind: {
                  path: "$jobBandData",
                  preserveNullAndEmptyArrays: true,
                },
              }
            ],
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
              from: "employeePhone",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$isPreferred', true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeePhone"
            }
        },
        {
          $unwind: {
            path: "$employeePhone",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
              from: "employeeEmail",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$isPreferred', true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeeEmail"
            }
        },
        {
          $unwind: {
            path: "$employeeEmail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
              from: "employeePhone",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$type', "Official"]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeeOfficialPhone"
            }
        },
        
        {
          $unwind: {
            path: "$employeeOfficialPhone",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
              from: "employeeEmail",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$type', "Official"]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeeOfficialEmail"
            }
        },
        {
          $unwind: {
            path: "$employeeOfficialEmail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
              from: "emergencyContact",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {$eq:["$isPrimary" , true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    },
                  ],
              as: "emergencyContact"
            }
        },
        {
          $unwind: {
            path: "$emergencyContact",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
              from: "address",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {$eq:["$isPrimary" , true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    },
                  ],
              as: "address"
            }
        },
        {
          $unwind: {
            path: "$address",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "employeeDependantOrBeneficiary",
            localField: "uuid",
            foreignField: "employeeUUID",
            as: "employeeDependantOrBeneficiary",
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
          $project: {
            _id: 1,
            uuid: 1,
            employeeID: "$id",
            employeeName: {
              $concat: ["$firstName", " ", "$lastName"],
            },
            managerUUID : 1,
            managerName :  {
              $concat: ["$managerData.firstName", " ", "$managerData.lastName"],
            },
            gender: 1,
            maritalStatus: 1,
            hireDate : 1,
            reasonForHire:1,
            reasonForHireName:"$reasonData.reasonName",
            jobType: 1,
            jobStatus : 1,
            employmentStatus : "$isActive",
            separationDate :1,
            file : 1,
            isActive: 1,
            employeePhone : "$employeePhone.phoneNumber",
            employeeEmail : "$employeeEmail.email",
            userId: 1,
            dob:1,
            celebratesOn:1,
            bloodGroup: 1,
            birthPlace: 1,
            birthState: 1,
            birthCountry: 1,
            nationality: 1,
            emergencyContact: 1,
            jobGrade:{$ifNull: ["$designationData.jobGradeData.gradeName","$designationData.jobGrade"]},
            jobBand:{$ifNull:["$designationData.jobBandData.bandName","$designationData.jobLevel"]},
            emergencyContactName :"$emergencyContact.contactName",
            relationship :"$emergencyContact.relationship",
            emergencyContactNumber :"$emergencyContact.phoneNo",
            employeePreferredAddress : "$address",
            employeeOfficialPhone : {
              $ifNull: [
                "$employeeOfficialPhone.phoneNumber",
                "N/A",
              ],
            },
            employeeOfficialEmail: {
              $ifNull: [
                "$employeeOfficialEmail.email",
                "N/A",
              ],
            },
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
              $ifNull: [
                "$departmentData.name", "$department"
              ]
            },
            employeeDependantOrBeneficiary : 1
          },
        },
      ]
      // call method to service
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);

      if (!result.length > 0) {
        return res.status(404).send("Employee not found in the database");
      }
      return res.status(200).send(result[0]);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find Employee, Data By: " + JSON.stringify(req.params));
      // call method to service
      let pipeline = [
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
            from: "roles",
            localField: "roleUUIDs",
            foreignField: "uuid",
            as: "roles",
          },
        },
        {
          $lookup: {
              from: "employeePhone",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$isPreferred', true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeePhone"
            }
        },
        
        {
          $lookup: {
              from: "employeeEmail",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$isPreferred', true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeeEmail"
            }
        },
        
        {
          $project: {
            _id: 1,
            uuid: 1,
            employeeID: "$id",
            userId: 1,
            jobType: 1,
            jobStatus : 1,
            hireDate : 1,
            isActive: 1,
            isLocked: 1,
            dob: 1,
            file: 1,
            employeePhone : {
              $ifNull: [
                "$employeePhone.phoneNumber",
                "N/A",
              ],
            },
            employeeEmail: {
              $ifNull: [
                "$employeeEmail",
                "N/A",
              ],
            },
            employeeName: {
              $concat: ["$firstName", " ", "$lastName"],
            },
            department: {
              $ifNull: ["$departmentData.name", "$department"],
            },
            location: {
              $ifNull: ["$locationData.locationName", "$location"],
            },
            designation: {
              $ifNull: ["$designationData.name", "$designation"],
            },
            roles: "$roles",
            designationId:"$designation",
            locationId:"$location",
            departmentId:"$department",
            managerUUID:1
          },
        }
      ];

      if(req.query?.limit != undefined && req.query?.skip != undefined) {
        pipeline.push(
          { $skip: Number(req.query?.skip)},
          { $limit: Number(req.query?.limit) }
        )
      }
      // call method to service
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);
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
      if (!result) {
        return res.status(404).send("Employee not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  // Lite API without image and unnecessary data
  findAllLite = async (req, res, next) => {
    try {
      console.log("Find Employee, Data By: " + JSON.stringify(req.params));
      // call method to service
      let pipeline = [
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
            _id: 1,
            uuid: 1,
            employeeID: "$id",
            userId: 1,
            isActive: 1,
            file: 1,
            dob:1,
            employeeName: {
              $concat: ["$firstName", " ", "$lastName"],
            },
            department: {
              $ifNull: ["$departmentData.name", "$department"],
            },
            location: {
              $ifNull: ["$locationData.locationName", "$location"],
            },
            designation: {
              $ifNull: ["$designationData.name", "$designation"],
            },
            designationId:"$designation",
            locationId:"$location",
            departmentId:"$department",

          },
        }
      ];

      if(req.query?.limit != undefined && req.query?.skip != undefined) {
        pipeline.push(
          { $skip: Number(req.query?.skip)},
          { $limit: Number(req.query?.limit) }
        )
      }
      // call method to service
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);
      
      if (!result) {
        return res.status(404).send("Employee not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createEmployee = async (req, res, next) => {
    try {
      console.log("Create Employee, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await EmployeeService.createEmployee(data, req);

      //send mail
      const inputObj=resp[0]
      const body={benefactorUUIDs:[resp[0].uuid],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.HIRE,body,req,inputObj)

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateEmployee = async (req, res, next) => {
    try {
      console.log("Update Employee, Data By: " + JSON.stringify(req.body));
      let data = req.body;
      const id=req.query.id;
      // call method to service
      let resp = await EmployeeService.updateEmployee(data, req);

      if(id){
        //send Mail
        const inputObj= await EmployeeService.findOneEmployee({uuid:data.uuid},req)
        const body={benefactorUUIDs:[data.uuid],initiatorUUID:res.locals.session?.userUUID}        
        if(id.toLowerCase()=='lockUnlock'.toLowerCase()){
          if(req.body.isLocked)generateMail(MAIL_NOTIFICATION_TYPE.LOCK_ACCOUNT,body,req,inputObj)
          else generateMail(MAIL_NOTIFICATION_TYPE.UNLOCK_ACCOUNT,body,req,inputObj)  
        }
        if(id.toLowerCase()=='updateBiographicalDetails'.toLowerCase()){
          generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_BIOGRAPHICAL_DETAILS,body,req,inputObj)
        }
        if(id.toLowerCase()=='updateHire'.toLowerCase()){
          generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_HIRE_INFO,body,req,inputObj)
        }
      }
      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  assignRole = async (req, res, next) => {
    try {
      console.log(
        "Assign role in Employee, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await EmployeeService.assignRoleToEmployees(data, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  unAssignRole = async (req, res, next) => {
    try {
      console.log(
        "unAssign Role in Employee, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await EmployeeService.unAssigRoleToEmployees(data, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  deleteEmployeeById = async (req, res, next) => {
    try {
      console.log("Update Employee, Data By: " + JSON.stringify(req.body));
      if (!req.params.uuid) throw new Error("Employee UUID is required.");
      let uuid = req.params.uuid;
      // call method to service
      let resp = await EmployeeService.deleteEmployee(uuid, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  filterEmployees = async (req, res, next) => {
    try {
      if (!Object.keys(req.body).length === 0)
        throw new Error("No data found for filter.");
        let pipeline = []
        let projection = {}
        let query = {};
        let designationQuery={};
        let roleQuery={};
        let certificateOrLicenseQuery = {};
        let lookups = [];
        let reportHeader=[];
        const reportType = req.body?.reportType

        if (req.body.nameOfTheCertificateOrLicense != undefined) {
          certificateOrLicenseQuery.nameOfTheCertificateOrLicense = { $in: req.body.nameOfTheCertificateOrLicense };
        }

        if(req.body?.reportType == "nationId") {
          projection = {
              sNo:"$nationID.sNo",
              nationUUID: "$nationID.uuid",
              identificationType : "$nationID.identificationType",
              identification : "$nationID.Identification",
              nameAsPerDocument : "$nationID.name",
              expiry : "$nationID.expiry"
          }
          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl. No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "ID_Type", key: "identificationType" },
              { label: "ID_Number", key: "identification" },
              { label: "Expiry_Date", key: "expiry" },
              { label: "Name_As_Per_Document", key: "nameAsPerDocument" }
            );
          }
          lookups.push({
            $lookup: {
                from: 'nationID',
                let : { 
                  "id": "$uuid"
                },
                "pipeline": [
                    { 
                        "$match": 
                        { 
                            isActive :true,
                            "$expr": {
                                $and : [
                                  { 
                                    "$eq": ["$employeeUUID", "$$id"]
                                  },
                                  ((req?.body?.identificationType) && {
                                    "$in": ["$identificationType", req?.body?.identificationType]
                                  }) || {},
                                ]
                              }
                        }
                    },
                    {
                      $project: {
                        _id: 0,
                        uuid:1,
                        identificationType : 1,
                        Identification : 1,
                        name: 1,
                        expiry :1,
                      }
                    }
                  ],
                as: 'nationID',
            }
          },
          {
              $unwind : {
                  path:"$nationID",
              }
          })
        }
        else if(req.body?.reportType == "BloodGroup") {
          projection = {
              sNo:"$sNo",
              age: "$age",
              gender : "$gender",
              bloodGroup : "$bloodGroup",
              department: {
                $ifNull: ["$departmentData.name", "$department"],
              },
              location: {
                $ifNull: ["$locationData.locationName", "$location"],
              },
          }
          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl. No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Employee_Department", key: "department" },
              { label: "Employee_Location", key: "location" },
              { label: "Age", key: "age" },
              { label: "Gender", key: "gender" },
              { label: "Blood_group", key: "bloodGroup" }
            );
          }
        }
        else if(req.body?.reportType == "Dependant") {
          projection = {
            relationWithEmployee: "$employeeDependantOrBeneficiary.relationWithEmployee",
            name : "$employeeDependantOrBeneficiary.name",
            gender : "$employeeDependantOrBeneficiary.gender",
            maritalStatus : "$employeeDependantOrBeneficiary.maritalStatus",
            age : "$employeeDependantOrBeneficiary.age",
            address:"$employeeDependantOrBeneficiary.address",
            isStudent:"$employeeDependantOrBeneficiary.isStudent",
            disabled:"$employeeDependantOrBeneficiary.disabled"
          }

          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Relation_With_Employee", key: "relationWithEmployee" },
              { label: "Name_Of_Dependant", key: "name" },
              { label: "Gender", key: "gender" },
              { label: "Marital_Status", key: "maritalStatus" },
              { label: "Age", key: "age" },
              { label: "Dependant_Address", key: "address" },
              { label: "Is_Student", key: "isStudent" },
              { label: "Disabled", key: "disabled" }
            )
          }
          const query={}
          if(req.body.createdDate){
            query.createdAt={ 
              $gte: new Date(moment(req.body.createdDate, "YYYY-MM-DD")),
              $lte: new Date(moment(req.body.createdDate, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD"))
            }
          }
          lookups.push(        {
            $lookup: {
                from: 'employeeDependantOrBeneficiary',
                let : { 
                  "id": "$uuid"
                },
                "pipeline": [
                    { 
                        "$match": 
                        { ...query,
                            "$expr": {
                                $and : [
                                  { 
                                    "$eq": ["$employeeUUID", "$$id"]
                                  },
                                  {
                                    "$eq":[ "$type",reportType]
                                  }|| {},
                                ]
                              }
                        }
                    },
                    {
                      $project: {
                        _id: 0,
                        uuid:1,
                        relationWithEmployee : 1,
                        name : 1,
                        gender: 1,
                        dob :1,
                        maritalStatus:1,
                        age:1,
                        address:{
                          $concat: ["$addressLineOne", ",", "$addressLineTwo",",","$city",",","$state",",","$country",",","$pinCode"],
                        },
                        isStudent:1,
                        disabled:1,
                        sNo:1
                      }
                    }
                  ],
                as: 'employeeDependantOrBeneficiary',
                
            }
          },
          {
              $unwind : {
                  path:"$employeeDependantOrBeneficiary",
              }
          })
        }
        // WorkExperience
        else if(req.body?.reportType == "WorkExperience") {
          projection = {
            totalExperience: "$workExperience.totalExperience",
            previousDesignation : "$workExperience.title",
            employmentType : "$workExperience.employmentType",
            previouscompanyName : "$workExperience.companyName",
            workedFrom : "$workExperience.startDateYear",
            workedTo : "$workExperience.endDateYear",
            reportingManagerName:"$workExperience.reportingManagerName",
            reportingManagerDesignation:"$workExperience.designation",
            reasonForLeaving:"$workExperience.reasonForLeaving",
          }

          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Total_Experience", key: "totalExperience" },
              { label: "Previous_Designation", key: "previousDesignation" },
              { label: "Employment_Type", key: "employmentType" },
              { label: "Previous_CompanyName", key: "previouscompanyName" },
              { label: "WorkedFrom", key: "workedFrom" },
              { label: "WorkedTo", key: "workedTo" },
              { label: "Reporting_ManagerName", key: "reportingManagerName" },
              { label: "Reporting_ManagerDesignation", key: "reportingManagerDesignation" },
              { label: "Reason_For_Leaving", key: "reasonForLeaving" }
            )
          }
          let query={}
          if(req.body.totalExperience != undefined ){
            // round of given total experience ex = 9.3
            let roundNumber = req.body.totalExperience | 0 //9
            // add one in the total experience 
            roundNumber++; //10
            // checking gte totalExperience & lessthen equal to roundNumber
            query.totalExperience = {
              $gte : req.body.totalExperience,
              $lt : roundNumber
            } 
          }
          lookups.push(        {
            $lookup: {
                from: 'workExperience',
                let : { 
                  "id": "$uuid"
                },
                "pipeline": [
                    { 
                        "$match": 
                        { ...query,
                            "$expr": {
                                $and : [
                                  { 
                                    "$eq": ["$employeeUUID", "$$id"]
                                  }
                                ]
                              }
                        }
                    },
                    {
                      $project: {
                        _id: 0,
                        uuid:1,
                        title: 1,
                        relationWithManager : 1,
                        totalExperience : 1,
                        designation : 1,
                        employmentType : 1,
                        companyName : 1,
                        startDateYear : 1,
                        endDateYear : 1,
                        reportingManagerName : 1, 
                        reasonForLeaving : 1,
                        sNo:1,
                      }
                    }
                  ],
                as: 'workExperience',
                
            }
          },
          {
              $unwind : {
                  path:"$workExperience",
              }
          })
        }
        //
        else if(req.body?.reportType == "Beneficiary") {
          projection = {
            name : "$employeeDependantOrBeneficiary.name",
            address:"$employeeDependantOrBeneficiary.address",
            beneficiaryType:"$employeeDependantOrBeneficiary.beneficiaryType",
          }
          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Beneficiary_Type", key: "beneficiaryType" },
              { label: "Name_Of_Beneficiary", key: "name" },
              { label: "Beneficiary_Address", key: "address" },
            )
          }
          const query={}
          if(req.body.createdDate){
            query.createdAt={ 
              $gte: new Date(moment(req.body.createdDate, "YYYY-MM-DD")),
              $lte: new Date(moment(req.body.createdDate, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD"))
            }
          }
        lookups.push({
            $lookup: {
                from: 'employeeDependantOrBeneficiary',
                let : { 
                  "id": "$uuid"
                },
                "pipeline": [
                    { 
                        "$match": 
                        { 
                          ...query,
                            "$expr": {
                                $and : [
                                  { 
                                    "$eq": ["$employeeUUID", "$$id"]
                                  },
                                  {
                                    "$eq":[ "$type",reportType]
                                  }|| {},
                                ]
                              }
                        }
                    },
                    {
                      $project: {
                        _id: 0,
                        uuid:1,
                        relationWithEmployee : 1,
                        name : 1,
                        beneficiaryType: 1,
                        gender: 1,
                        dob :1,
                        maritalStatus:1,
                        age:1,
                        address:{
                          $concat: ["$addressLineOne", ",", "$addressLineTwo",",","$city",",","$state",",","$country",",","$pinCode"],
                        },
                        isStudent:1,
                        disabled:1,
                        sNo:1
                      }
                    }
                  ],
                as: 'employeeDependantOrBeneficiary',
                
            }
          },
          {
              $unwind : {
                  path:"$employeeDependantOrBeneficiary",
              }
          })

        } 
        else if(req.body?.reportType == "Employee" || req.body?.reportType == "Peers") {
          projection = {
            managerId : "$managerData.id",
            managerName :  {
              $concat: ["$managerData.firstName", " ", "$managerData.lastName"],
            },
            fatherOrHusband: 1,
            fatherOrHusbandName: 1,
            maritalStatus: 1,
            hireDate : 1,
            jobType: 1,
            jobStatus : 1,
            employmentStatus : "$isActive",
            dob:1,
            file:1,
            employeeOfficialPhone : {
              $ifNull: [
                "$employeeOfficialPhone.phoneNumber",
                "N/A",
              ],
            },
            employeeOfficialEmail: {
              $ifNull: [
                "$employeeOfficialEmail.email",
                "N/A",
              ],
            },
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
            address: "$address.fullAddress",
          }

          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Employee_Designation", key: "designation" },
              { label: "Employee_Department", key: "department" },
              { label: "Employee_Location", key: "location" },
              { label: "Job_Type", key: "jobType" },
              { label: "Job_Status", key: "jobStatus" },
              { label: "Employee_Status", key: "employeeStatus" },
              { label: "FatherOrHusband", key: "fatherOrHusband" },
              { label: "FatherOrHusband_Name", key: "fatherOrHusbandName" },
              { label: "Date_Of_Birth", key: "dob" },
              { label: "Hire_Date", key: "hireDate" },
              { label: "Manager_ID", key: "managerUUID" },
              { label: "Manager_Name", key: "managerName" },
              { label: "Employee_Address", key: "location" },
              { label: "Official_Phone_Number", key: "officialPhoneNumber" },
              { label: "Official_Email", key: "officialEmail" },
            )
          }

          lookups.push(
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
                  from: "address",
                  let: { empUUID :"$uuid"},
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$isPrimary', true]},
                                { $eq: ['$employeeUUID', '$$empUUID']}
                              ]
                            }
                          }
                        },
                        {
                          $project: {
                            _id: 0,
                            uuid:1,
                            fullAddress:{
                              $concat: ["$address1", ",", "$address2",",","$city",",","$state",",","$country"],
                            },
                          }
                        }
                      ],
                  as: "address"
                }
            },
            {
              $unwind: {
                path: "$address",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                  from: "employeePhone",
                  let: { empUUID :"$uuid"},
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$type', "Official"]},
                                { $eq: ['$isPreferred', true]},
                                { $eq: ['$employeeUUID', '$$empUUID']}
                              ]
                            }
                          }
                        }
                      ],
                  as: "employeeOfficialPhone"
                }
            },
            {
              $unwind: {
                path: "$employeeOfficialPhone",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                  from: "employeeEmail",
                  let: { empUUID :"$uuid"},
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$type', "Official"]},
                                { $eq: ['$isPreferred', true]},
                                { $eq: ['$employeeUUID', '$$empUUID']}
                              ]
                            }
                          }
                        }
                      ],
                  as: "employeeOfficialEmail"
                }
            },
            {
              $unwind: {
                path: "$employeeOfficialEmail",
                preserveNullAndEmptyArrays: true,
              },
            },
          )
        }
        else if(req.body?.reportType == "EmergencyContact") {
          projection = {
            emergencyContactUUID : "$emergencyContact.uuid",
            emergencyContactName : "$emergencyContact.contactName",
            emergencyContactNumber :"$emergencyContact.phoneNo",
            emergencyContactAddress : "$emergencyContact.address",
            
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
          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Employee_Location", key: "location" },
              { label: "Employee_Department", key: "department" },
              { label: "Emergency_Contact_Name", key: "emergencyContactName" },
              { label: "Emergency_Contact_Address", key: "emergencyContactAddress" },
              { label: "Emergency_Contact_Phone", key: "emergencyContactNumber" },
            )
          }
          lookups.push( {
            // Emergency contact
            $lookup: {
                from: 'emergencyContact',
                let : { 
                  "id": "$uuid"
                },
                "pipeline": [
                    { 
                        "$match": 
                        {
                            "$expr": {
                                $and : [
                                  { 
                                    "$eq": ["$employeeUUID", "$$id"]
                                  },
                                  ((req?.body?.isPrimary) && {
                                    "$eq": ["$isPrimary", req?.body?.isPrimary]
                                  }) || {},
                                ]
                              }
                        }
                    },
                    {
                      $project: {
                        _id: 0,
                        uuid:1,
                        contactName:1,
                        phoneNo:1,
                        address:{
                          $concat: ["$addressLine1", ",", "$addressLine2",",","$city",",","$state",",","$country"],
                        },
                      }
                    }
                  ],
                as: 'emergencyContact',
            }
          },
          {
            $unwind:{
              path:"$emergencyContact",
            }
          })
        }
        else if(req.body?.reportType == "Department"){
          if(req.body?.exportData) 
          {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Employee_Designation", key: "designation" },
              { label: "Employee_Department", key: "department" },
              { label: "Employee_Location", key: "location" },
              { label: "Date_Of_Joining", key: "hireDate" },
              { label: "Manager_Name", key: "managerName" },
              { label: "Job_Grade", key: "jobGrade" },
              { label: "Job_Band", key: "jobBand" },
            )
          }
            lookups.push(
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
              
              )
              projection = {
                "hireDate" : 1,
                managerName :  {
                  $concat: ["$managerData.firstName", " ", "$managerData.lastName"],
                },
                department: {
                  $ifNull: ["$departmentData.name", "$department"],
                },
                location: {
                  $ifNull: ["$locationData.locationName", "$location"],
                },
                designation: {
                  $ifNull: ["$designationData.name", "$designation"],
                },
                jobGrade:{$ifNull: ["$designationData.jobGradeData.gradeName","$designationData.jobGrade"]},
                jobBand:{$ifNull:["$designationData.jobBandData.bandName","$designationData.jobLevel"]},
              }
        } 
        else if(req.body?.reportType == "License" || req.body?.reportType == "Certificate"){
          if(req.body?.exportData) 
          {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Employee_Department", key: "department" },
              { label: "Employee_Location", key: "location" },
              { label: "Name", key: "nameOfTheCertificateOrLicense" },
              { label: "Validity", key: "validity" },
              { label: "Level_Of_Certification", key: "levelOfCertification" }
            )
          }
          projection = {
            nameOfTheCertificateOrLicense :  "$certificateOrlicense.nameOfTheCertificateOrLicense",
            validity :  "$certificateOrlicense.validity",
            levelOfCertification :  "$certificateOrlicense.levelOfCertification",
            licenseUUID :  "$certificateOrlicense.uuid",
            department: {
              $ifNull: ["$departmentData.name", "$department"],
            },
            location: {
              $ifNull: ["$locationData.locationName", "$location"],
            }
          }
          lookups.push(
            {
              $lookup: {
                from: 'certificateOrlicense',
                let : { 
                  "id": "$uuid"
                },
                "pipeline": [
                    { 
                        "$match": 
                        { 
                          ...certificateOrLicenseQuery,
                            "$expr": {
                                $and : [
                                  { 
                                    "$eq": ["$employeeUUID", "$$id"]
                                  },
                                  {
                                    "$eq": ["$type", req.body.reportType]
                                  }
                                ]
                              }
                        }
                    },
                    {
                      $project: {
                        _id: 0,
                        uuid:1,
                        nameOfTheCertificateOrLicense : 1,
                        validity : 1,
                        levelOfCertification:1
                      }
                    }
                  ],
                as: 'certificateOrlicense',
              }
            },
            {
              $unwind: {
                path: "$certificateOrlicense"
              },
            },
            
            )
        }
        else if(req.body?.reportType == "Role"){
            if (req.body.roles != undefined) {
              roleQuery.uuid = { $in: req.body.roles };
            }
            if(req.body?.exportData) 
            {
              reportHeader.push(
                { label: "Sl_No.", key: "SNo" },
                { label: "Employee_Id", key: "employeeID" },
                { label: "Employee_Name", key: "employeeName" },
                { label: "Employee_Designation", key: "designation" },
                { label: "Employee_Department", key: "department" },
                { label: "Employee_Location", key: "location" },
                { label: "Roles", key: "roles" },
              )
            }
            lookups.push(
              {
                $lookup: {
                  from: "roles",
                  let: { 'roleIds': '$roleUUIDs' },
                  pipeline: [
                    { $match: { ...roleQuery,'$expr': { '$in': ['$uuid', '$$roleIds'] } } }
                  ],
                  as: "rolesData",
                },
              })
              projection = {
                department: {
                  $ifNull: ["$departmentData.name", "$department"],
                },
                location: {
                  $ifNull: ["$locationData.locationName", "$location"],
                },
                designation: {
                  $ifNull: ["$designationData.name", "$designation"],
                },
                roles:{$ifNull:["$rolesData.name","N/A"]}
              }
          }
          else if(req.body?.reportType == "Hire_Separation"){
            const companyName = req.subdomain;
            const actionDB = await switchDB(companyName, actionSchemas);
            const actionModel = await getDBModel(actionDB, "action");
            const seperateAction = await actionModel
            .findOne({
              actionCode:{ $regex: "SEP", '$options': 'i' } ,
              isActive: true,
            })
            let onlySepData=false;
            const type=req.body.type?req.body.type:"BOTH"
            if (type != undefined && type=="SEP") {
              onlySepData=true
            }
            if(req.body.fromDate || req.body.toDate){
              let fromDate,toDate;
              if(req.body.fromDate && req.body.toDate){
                fromDate=new Date(req.body.fromDate)
                toDate=new Date(req.body.toDate)
                toDate.setDate(toDate.getDate()+1);
              }
              else if(req.body.fromDate){
                fromDate=new Date(req.body.fromDate)
                toDate=new Date()
                toDate.setDate(toDate.getDate()+1);
              }
              else if(req.body.toDate){
                toDate=new Date(req.body.toDate)
                fromDate=new Date('01-01-1900')
              }
              //add ist diff time
              commonUtils.addISTDiffTime(fromDate);
              commonUtils.addISTDiffTime(toDate);

              //removeTime from date
              commonUtils.removeTimeFromDate(fromDate);
              commonUtils.removeTimeFromDate(toDate);

              //convertToUTC
              commonUtils.removeISTDiffTime(fromDate);
              commonUtils.removeISTDiffTime(toDate);
              query.hireDate={"$gte":fromDate,"$lt":toDate}
            }
            if(req.body?.exportData) 
            {
              reportHeader.push(
                { label: "Sl_No.", key: "SNo" },
                { label: "Employee_Id", key: "employeeID" },
                { label: "Employee_Name", key: "employeeName" },
                { label: "Employee_Designation", key: "designation" },
                { label: "Employee_Department", key: "department" },
                { label: "Employee_Location", key: "location" },
                { label: "Date_Of_Hire", key: "hireDate" },
                { label: "Reason_For_Hire", key: "hireReasonName" },
                { label: "Date_Of_Exit", key: "exitDate" },
                { label: "Reason_For_Exit", key: "exitReasonName" },
              )
            }
            lookups.push(
              {
                $lookup: {
                    from: "employeeInfoHistory",
                    localField:"uuid",
                    foreignField:"employeeUUID",
                    pipeline:[{
                      $match:{
                        isDeleted:false,
                        "type":"EmployeeJobDetails",
                        "historyObject.action":seperateAction.actionCode,
                      }
                    },
                      {
                        $lookup: {
                          from: "reasons",
                          localField: "historyObject.actionReason",
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
                    ],
                    as: "employeeHistory",
                  },
                },
                {
                  $unwind: {
                    path: "$employeeHistory",
                    preserveNullAndEmptyArrays:  !onlySepData,
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
              }
            )
            projection = {
              exitDate: {$ifNull: ["$employeeHistory.effectiveDate","N/A"]},
              reasonForExit: {$ifNull: ["$employeeHistory.historyObject.actionReason","N/A"]},
              exitReasonName:{$ifNull: ["$employeeHistory.reasonData.reasonName","N/A"]},
              hireDate: 1,
              reasonForHire: 1,
              hireReasonName:"$reasonData.reasonName",
              department: {
                $ifNull: ["$departmentData.name", "$department"],
              },
              location: {
                $ifNull: ["$locationData.locationName", "$location"],
              },
              designation: {
                $ifNull: ["$designationData.name", "$designation"],
              }
            }
          } else if(req.body?.reportType == "ProbationConfirmation") {
            projection = {
              hireDate : 1,
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
  
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Sl_No.", key: "SNo" },
                { label: "Employee_Id", key: "employeeID" },
                { label: "Employee_Name", key: "employeeName" },
                { label: "Employee_Designation", key: "designation" },
                { label: "Employee_Department", key: "department" },
                { label: "Employee_Location", key: "location" },
                { label: "Hire_Date", key: "hireDate" },
              )
            }
        }
        else if(req.body?.reportType == "MissingInfo"){
          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl_No.", key: "SNo" },
              { label: "Employee_Id", key: "employeeID" },
              { label: "Employee_Name", key: "employeeName" },
              { label: "Employee_Designation", key: "designation" },
              { label: "Employee_Department", key: "department" },
              { label: "Employee_Location", key: "location" },
            )
          }
          projection = {
            department: {
              $ifNull: ["$departmentData.name", "$department"],
            },
            location: {
              $ifNull: ["$locationData.locationName", "$location"],
            },
            designation: {
              $ifNull: ["$designationData.name", "$designation"],
            },
          }
          if(req.body?.reportBy == "Employee" || req.body.dataTypes?.includes("Image")) {
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Employee_Image", key: "file" }
              )
            }
            projection.file= {$cond: [{$not: ["$file"]}, "Empty", "Data Entered"]}
          }
          if(req.body?.reportBy == "Employee" || req.body.dataTypes?.includes("BloodGroup")) {
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Blood_Group", key: "bloodGroup" },
              )
            }
            projection.bloodGroup= {$cond: [{$not: ["$bloodGroup"]}, "Empty", "Data Entered"]}
          }
          // Dependant data
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("Dependant")){
            lookups.push(        {
              $lookup: {
                  from: 'employeeDependantOrBeneficiary',
                  let : { 
                    "id": "$uuid"
                  },
                  "pipeline": [
                      { 
                          "$match": 
                          {
                              "$expr": {
                                  $and : [
                                    { 
                                      "$eq": ["$employeeUUID", "$$id"]
                                    },
                                    {
                                      "$eq":[ "$type","Dependant"]
                                    }
                                  ]
                                }
                          }
                      },
                    ],
                  as: 'employeeDependantOrBeneficiary',
                  
              }
            },
            {
                $unwind : {
                    path:"$employeeDependantOrBeneficiary",
                    preserveNullAndEmptyArrays: true,
                }
            })
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Dependant", key: "dependant" }
              )
            }
            projection.dependant = {$cond: [{$not: ["$employeeDependantOrBeneficiary"]}, "Empty", "Data Entered"]}
          }
          // Address
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("Address")){
            lookups.push(
              {
                $lookup: {
                    from: "address",
                    let: { empUUID :"$uuid"},
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  {$eq:["$isPrimary" , true]},
                                  { $eq: ['$employeeUUID', '$$empUUID']}
                                ]
                              }
                            }
                          },
                        ],
                    as: "address"
                  }
              },
              {
                $unwind: {
                  path: "$address",
                  preserveNullAndEmptyArrays: true,
                },
              }
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Employee_Address", key: "address" }
              )
            }
            projection.address= {$cond: [{$not: ["$address"]}, "Empty", "Data Entered"]}
          }
          // Employee Email
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("Email")){
            lookups.push(
              {
                $lookup: {
                    from: "employeeEmail",
                    let: { empUUID :"$uuid"},
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ['$type', "Official"]},
                                  { $eq: ['$isPreferred', true]},
                                  { $eq: ['$employeeUUID', '$$empUUID']}
                                ]
                              }
                            }
                          }
                        ],
                    as: "employeeOfficialEmail"
                  }
              },
              {
                $unwind: {
                  path: "$employeeOfficialEmail",
                  preserveNullAndEmptyArrays: true,
                },
              },
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Official_Email", key: "employeeOfficialEmail" },
              )
            }
            projection.employeeOfficialEmail= {$cond: [{$not: ["$employeeOfficialEmail"]}, "Empty", "Data Entered"]}
          }
          // Phone number
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("Phone")){
            lookups.push(
              {
                $lookup: {
                    from: "employeePhone",
                    let: { empUUID :"$uuid"},
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ['$type', "Official"]},
                                  { $eq: ['$isPreferred', true]},
                                  { $eq: ['$employeeUUID', '$$empUUID']}
                                ]
                              }
                            }
                          }
                        ],
                    as: "employeeOfficialPhone"
                  }
              },
              {
                $unwind: {
                  path: "$employeeOfficialPhone",
                  preserveNullAndEmptyArrays: true,
                },
              },
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Official_Phone_Number", key: "employeeOfficialPhone" },
              )
            }
            projection.employeeOfficialPhone= {$cond: [{$not: ["$employeeOfficialPhone"]}, "Empty", "Data Entered"]}
          }
          // Emergency contact
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("EmergencyContact")){
            lookups.push(
            {

              $lookup: {
                  from: 'emergencyContact',
                  let : { 
                    "id": "$uuid"
                  },
                  "pipeline": [
                      { 
                          "$match": 
                          {
                              "$expr": {
                                  $and : [
                                    { 
                                      "$eq": ["$employeeUUID", "$$id"]
                                    },
                                    {
                                      "$eq": ["$isPrimary", req?.body?.isPrimary]
                                    }
                                  ]
                                }
                          }
                      },
                      {"$limit":1},
                      {
                        $project: {
                          _id: 0,
                          uuid:1,
                        }
                      }
                    ],
                  as: 'emergencyContact',
              }
            },
            {
              $unwind:{
                path:"$emergencyContact",
                preserveNullAndEmptyArrays: true
              }
            }
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Emergency_Contact", key: "emergencyContact" }
              )
            }
            projection.emergencyContact= {$cond: [{$not: ["$emergencyContact"]}, "Empty", "Data Entered"]}
          }
          // Education
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("Education")){
            lookups.push(
              {
                $lookup: {
                    from: 'education',
                    let : { 
                      "id": "$uuid"
                    },
                    "pipeline": [
                        { 
                            "$match": 
                            { 
                                isActive :true,
                                "$expr": {
                                    $and : [
                                      { 
                                        "$eq": ["$employeeUUID", "$$id"]
                                      },
                                    ]
                                  }
                            }
                        },
                        {"$limit":1},
                        {
                          $project: {
                            _id: 0,
                            uuid:1,
                          }
                        }
                      ],
                    as: 'education',
                }
              },
              {
                  $unwind : {
                      path:"$education",
                      preserveNullAndEmptyArrays: true
                  }
              },
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Education", key:"education"}
              )
            }
            projection.education= {$cond: [{$not: ["$education"]}, "Empty", "Data Entered"]}
          }
          // NationId
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("NationId")) {
            lookups.push(
              {
                $lookup: {
                  from: 'nationID',
                  let : { 
                    "id": "$uuid"
                  },
                  "pipeline": [
                      { 
                          "$match": 
                          { 
                              isActive :true,
                              "$expr": {
                                  $and : [
                                    { 
                                      "$eq": ["$employeeUUID", "$$id"]
                                    },
                                  ]
                                }
                          }
                      },
                      {"$limit":1},
                      {
                        $project: {
                          _id: 0,
                          uuid:1,
                        }
                      }
                    ],
                  as: 'nationID',
              }
              },
              {
                  $unwind : {
                      path:"$nationID",
                      preserveNullAndEmptyArrays: true
                  }
              }
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Nation_ID", key: "nationId" }
              )
            }
            projection.nationId= {$cond: [{$not: ["$nationId"]}, "Empty", "Data Entered"]}
          }
          // WorkExerience
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("WorkExperience")){
              lookups.push({
                $lookup: {
                    from: 'workExperience',
                    let : { 
                      "id": "$uuid"
                    },
                    "pipeline": [
                        { 
                            "$match": 
                            { 
                                isActive :true,
                                "$expr": {
                                    $and : [
                                      { 
                                        "$eq": ["$employeeUUID", "$$id"]
                                      },
                                    ]
                                  }
                            }
                        },
                        {"$limit":1},
                        {
                          $project: {
                            _id: 0,
                            uuid:1,
                          }
                        }
                      ],
                    as: 'workExperience',
                }
              },
              {
                  $unwind : {
                      path:"$workExperience",
                      preserveNullAndEmptyArrays: true
                  }
              },
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "WorkExperience", key:"workExperience"}
              )
            }
            projection.workExperience = {$cond: [{$not: ["$workExperience"]}, "Empty", "Data Entered"]}
          }
          // CertificateOrLicense
          if(req.body?.reportBy == "Employee" || req.body?.dataTypes?.includes("CertificateOrLicense")){
              lookups.push(
              {
                $lookup: {
                  from: 'certificateOrlicense',
                  let : { 
                    "id": "$uuid"
                  },
                  "pipeline": [
                      { 
                          "$match": 
                          { 
                            ...certificateOrLicenseQuery,
                              "$expr": {
                                  $and : [
                                    { 
                                      "$eq": ["$employeeUUID", "$$id"]
                                    }
                                  ]
                                }
                          }
                      },
                      {"$limit":1},
                      {
                        $project: {
                          _id: 0,
                          uuid:1,
                        }
                      }
                    ],
                  as: 'certificateOrlicense',
                }
              },
              {
                $unwind: {
                  path: "$certificateOrlicense",
                  preserveNullAndEmptyArrays: true
                }
              }
            )
            if(req.body?.exportData) {
              reportHeader.push(
                { label: "Certificate_Or_License", key: "certificateOrLicense" }
              )
            }
            projection.certificateOrLicense= {$cond: [{$not: ["$certificateOrLicense"]}, "Empty", "Data Entered"]}
          }
        }
        else {
          projection = {
              userId: 1,
              jobType: 1,
              jobStatus : 1,
              hireDate : 1,
              isActive: 1,
              dob: 1,
              department: {
                $ifNull: ["$departmentData.name", "$department"],
              },
              location: {
                $ifNull: ["$locationData.locationName", "$location"],
              },
              designation: {
                $ifNull: ["$designationData.name", "$designation"],
              },
          }
        }
        if(req.body?.reportType && req.body?.reportType != "Hire_Separation"){
          query.isActive = true;
        }
      if (req.body.employeeName!='' && req.body.employeeName != undefined){
        //read search string in 'fn ln - un' format
        let search = req.body.employeeName;
        let fn = ""; let ln = ""; let un = "";
        search = search.includes('-') ? search.replace(/-/g,' ') : search; //replace - with space
        search = search.includes(' ') ? search.replace(/  +/g, ' ') : search; //replace multiple spaces with single space
        search = search.trim().split(' ');
        if(search.length == 3 || search.length > 3){ fn = search[0]; ln = search[1]; un = search[2]; }
        else if(search.length == 2){ fn = search[0]; ln = search[1]; un = search[1]; }
        else if(search.length == 1){ fn = search[0]; ln = search[0]; un = search[0]; }
        query = {
          $or:[{firstName:{'$regex' : `^${fn}`, '$options' : 'i'} },{lastName:{'$regex' : `^${ln}`, '$options' : 'i'}},{middleName:{'$regex' : `^${un}`, '$options' : 'i'}}]
        }                  
      }
      if (req.body?.bloodGroup != undefined) {
        query.bloodGroup = {$in : req.body?.bloodGroup}
      }
      if (req.body?.fromAge != undefined && req.body?.toAge != undefined) {
        query = {
        $and: [
             {age:{ $gte: req.body.fromAge }},
             {age:{ $lte: req.body.toAge }},
        ]
        }
      }
      if (req.body.gender != undefined) {
        query.gender = { $in: req.body.gender };
      }
      if (req.body.department != undefined) {
        query.department = { $in: req.body.department };
      }
      if (req.body.location != undefined) {
        query.location = { $in: req.body.location };
      }
      if (req.body.designation != undefined) {
        query.designation = { $in: req.body.designation };
      }
      if (req.body.jobGrade != undefined) {
        designationQuery.jobGrade = { $in: req.body.jobGrade };
      }
      if (req.body.jobBand != undefined) {
        designationQuery.jobLevel = { $in: req.body.jobBand };
      }
      if (req.body.employmentType != undefined) {
        query.jobType = { $in: req.body.employmentType };
      }
      if (req.body.employeeStatus != undefined) {
        query.isActive = { $in: req.body.employeeStatus };
      }
      if (req.body.jobStatus != undefined) {
        query.jobStatus = { $in: req.body.jobStatus };
      }
      // managerUUID we can use for Peers also.
      if (req.body.managerUUID != undefined) {
        query.managerUUID = { $in: req.body.managerUUID };
      }
      
      if (req.body.joiningDate) {
        const startDate=new Date(req.body.joiningDate)
        const endDate=new Date(startDate);
        endDate.setDate(endDate.getDate()+1)
        commonUtils.addISTDiffTime(startDate);
        commonUtils.addISTDiffTime(endDate);
        commonUtils.removeTimeFromDate(startDate);
        commonUtils.removeTimeFromDate(endDate);
        commonUtils.removeISTDiffTime(startDate);
        commonUtils.removeISTDiffTime(endDate);
        console.log("Joining Date",req.body.joiningDate);
        console.log("StartDate",startDate)
        console.log("endDate",endDate)
        query.hireDate={
          $gte: startDate,
          $lt: endDate
        }
        // const joiningDate=new Date(req.body.joiningDate)
        // const month=joiningDate.getMonth()+1;
        // const date=joiningDate.getDate();
        // const year=joiningDate.getFullYear();
        // query= {...query, "$expr":{$and:[{"$eq": [{ "$month": {date:"$hireDate",timezone:CURRENT_TIME_ZONE} },month ]},{"$eq": [{ "$dayOfMonth": {date:"$hireDate",timezone:CURRENT_TIME_ZONE} }, date]},{"$eq": [{ "$year": {date:"$hireDate",timezone:CURRENT_TIME_ZONE} }, year]}] } } 
      }
      if (!Object.keys(query)) throw new Error("no such query");
      let data = {}
      let savedDownloadResults = []
      if(reportType && req.body?.exportData) {
      savedDownloadResults = await downloadResultsService.create(
          data = { 
            type  : reportType,
            downloadedBy  : req.body?.downloadedBy,
            status : "In Progress",
            downloadedData: [],
            reportHeader:reportHeader
          },
          req
        )
      }


      pipeline = [
        {
          $match: {
            ...query,
          },
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
            pipeline: [
              {
                $match: {
                  ...designationQuery
                },
              },
              {
                $lookup: {
                  from: "jobGrade",
                  localField: "jobGrade",
                  foreignField: "gradeId",
                  as:"jobGradeData"
                }
              },
              {
                $unwind: {
                  path: "$jobGradeData",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "jobBand",
                  localField: "jobLevel",
                  foreignField: "bandId",
                  as:"jobBandData"
                }
              },
              {
                $unwind: {
                  path: "$jobBandData",
                  preserveNullAndEmptyArrays: true,
                },
              }
            ],
            as: "designationData",
          },
        },
        {
          $unwind: {
            path: "$designationData",
            preserveNullAndEmptyArrays: Object.keys(designationQuery).length>0?false:true,
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
        ...lookups,
       
        
        {
          $project: {
            ...projection,
            _id: 0,
            uuid: 1,
            employeeID: "$id",
            employeeName: {
              $concat: ["$firstName", " ", "$lastName"],
            },
          }
        }
      ];

      
      if(req.query?.limit != undefined && req.query?.skip != undefined) {
        pipeline.push(
          { $skip: Number(req.query?.skip)},
          { $limit: Number(req.query?.limit) }
        )
      }

      let result = await EmployeeService.findMultipleEmployees(pipeline, req);
      result.map((record,index)=>{
        record['SNo']=index+1
      })
      if(reportType?.toLowerCase()=="Role".toLowerCase() && Object.keys(roleQuery).length>0)
      {
        result=result.filter(data=>data.roles.length>0)
      }
      if(reportType?.toLowerCase()=="Hire_Separation".toLowerCase())
      {
        if(req.body.type?.toLowerCase()=="HIRE".toLowerCase())
          result=result.filter(data=>data.exitDate=="N/A")
        else if(req.body.type?.toLowerCase()=="SEP".toLowerCase())
          result=result.filter(data=>data.exitDate!="N/A")
      }
      if(reportType && req.body?.exportData && savedDownloadResults) {
        
        await downloadResultsService.update(
          { 
            uuid : savedDownloadResults[0].uuid,
            downloadedBy  : req.body?.downloadedBy,
            status : "Completed",
            downloadedData: result
          },
          req
        )
      }

      if (!result) {
        return res.status(404).send("Employee not found in the database");
      }
      if(req.body?.reportType == "Peers") {
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
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  fetchEmployeesHirarchy = async (req, res, next) => {
    try {
      console.log("Find Employee, Data By: " + JSON.stringify(req.query));
      if (!req.query.uuid) throw new Error("Employee uuid is required.");
      const employeeUUID = req.query.uuid
      let employeeTypeList = []
      let query = {
              uuid:  employeeUUID
      };

      const orgChartSetup =  await orgChartSetupService.findOrgChartSetup({}, req)
      employeeTypeList = orgChartSetup?.employeeTypeList.map(employeeType =>{
          if(employeeType.isSelected){
            return employeeType.name
          } else {
            return null
          }
      }).filter(item => item)

      // if(employeeTypeList.length > 0){
      //   query.jobType = {$in: employeeTypeList}
        
      // }
      let projection = {}
      if(orgChartSetup && orgChartSetup?.attributesList) {
        
        for (const iterator of orgChartSetup?.attributesList) {
          if(iterator?.name == "Employee Image" && iterator?.isSelected) {
            projection["file"] =  1
          }
          if(iterator?.name == "Name" && iterator?.isSelected) {
            projection["employeeName"] =  {
              $concat: ["$firstName", " ", "$lastName"],
            }
          }
          if(iterator?.name == "Location" && iterator?.isSelected) {
            projection["location"] = {
                $ifNull: [ "$locationData.locationName", "$location" ]
              }
          }
          if(iterator?.name == "Designation" && iterator?.isSelected) {
              projection["designation"] ={
                $ifNull: [ "$designationData.name", "$designation" ]
              }
          }
          if(iterator?.name == "Department" && iterator?.isSelected) {
            projection["department"] = {
              $ifNull: ["$departmentData.name", "$department"]
            }
          }
          if(iterator?.name == "Email ID" && iterator?.isSelected) {
            projection["employeeEmail"] = {
              $ifNull: [ "$employeeEmail.email", "NA" ]
            }
          }
          if(iterator?.name == "Phone" && iterator?.isSelected) {
            projection["employeePhone"] = {
              $ifNull: ["$employeePhone.phoneNumber", "NA"]
            }
          }
        }
      }
      
      // call method to service
      let pipeline = [
        {
          $match: query
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
              from: "employeePhone",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$isPreferred', true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeePhone"
            }
        },
        {
          $unwind: {
            path: "$employeePhone",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
              from: "employeeEmail",
              let: { empUUID :"$uuid"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$isPreferred', true]},
                            { $eq: ['$employeeUUID', '$$empUUID']}
                          ]
                        }
                      }
                    }
                  ],
              as: "employeeEmail"
            }
        },
        {
          $unwind: {
            path: "$employeeEmail",
            preserveNullAndEmptyArrays: true,
          },
        },
        
        // Manager Data
        {
          $lookup: {
          from: "employee",
          let: {
            manageruuid: "$managerUUID",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$uuid", "$$manageruuid"],
                    },
                    {
                      $in: ["$jobType", employeeTypeList]
                    }
                    
                  ],
                },
              },
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
                  from: "employeePhone",
                  let: { empUUID :"$uuid"},
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$isPreferred', true]},
                                { $eq: ['$employeeUUID', '$$empUUID']}
                              ]
                            }
                          }
                        }
                      ],
                  as: "employeePhone"
                }
            },
            {
              $unwind: {
                path: "$employeePhone",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                  from: "employeeEmail",
                  let: { empUUID :"$uuid"},
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$isPreferred', true]},
                                { $eq: ['$employeeUUID', '$$empUUID']}
                              ]
                            }
                          }
                        }
                      ],
                  as: "employeeEmail"
                }
            },
            {
              $unwind: {
                path: "$employeeEmail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                ...projection,
                _id: 1,
                id:1,
                uuid: 1,
                employeeID: "$id",
                userId: 1,
              },
            },
          ],
          as: "managerData",
        }
        },

        // reportees
        {
          $lookup: {
          from: "employee",
          let: {
            empUUID: "$id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$managerUUID", employeeUUID],
                    },
                    {
                      $in: ["$jobType", employeeTypeList]
                    }
                  ],
                },
              },
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
                  from: "employeePhone",
                  let: { empUUID :"$uuid"},
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$isPreferred', true]},
                                { $eq: ['$employeeUUID', '$$empUUID']}
                              ]
                            }
                          }
                        }
                      ],
                  as: "employeePhone"
                }
            },
            {
              $unwind: {
                path: "$employeePhone",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                  from: "employeeEmail",
                  let: { empUUID :"$uuid"},
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$isPreferred', true]},
                                { $eq: ['$employeeUUID', '$$empUUID']}
                              ]
                            }
                          }
                        }
                      ],
                  as: "employeeEmail"
                }
            },
            {
              $unwind: {
                path: "$employeeEmail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                ...projection,
                _id: 1,
                id:1,
                uuid: 1,
                employeeID: "$id",
                userId: 1,
              },
            },
          ],
          as: "reportees",
        }
        },
       
        {
          $project: {
            ...projection,
            _id: 1,
            id:1,
            uuid: 1,
            employeeID: "$id",
            userId: 1,
            managerUUID : 1,
            managerData : 1,
            reportees: 1,
          },
        },
      ]
      // call method to service
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);

      if (!result.length > 0) {
        return res.status(404).send("Employee not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  uploadEmployee = async (req, res) => {
    try {
      console.log("Upload Employee, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await EmployeeService.createAllEmployee(data, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  generateCSVHeader = async (req, res, next) => {
    try {
      const autoNumberingData =
        await autoNumberingService.getAutoNumberingByType(
          { type: "EMP" },
          req,
          res
        );
        let CSVHeader = [];
        
        if (!autoNumberingData?.autoGenerated) {
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
      const data = {
        CSVHeader: CSVHeader,
        autoNumberingData: autoNumberingData,
      };
      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  getManagerUploadCSVHeader = async (req, res, next) => {
    try {
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "employeeId" },
        { label: "Action", key: "actionCode" },
        { label: "Action_Reason", key: "actionReason" },
        { label: "Effective_Date", key: "effectiveDate" },
        { label: "Manager_ID", key: "managerId" },
      );
      const data = {
        CSVHeader: CSVHeader
      };
      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }

  getEmployeesByBirthDateOrHireDate= async(req,res)=>{
    try{
      console.log("currentTimeZone",CURRENT_TIME_ZONE);
      let query={};
      let startDate;
      let endDate;
      if(!req.query.fetchBy) throw new Error("Please send 'fetchBy' query param in order to fetch employees");
      if(!req.query.startDate) startDate=new Date();
      else startDate = new Date(moment(req.query.startDate, "YYYY-MM-DD"))
      if(!req.query.endDate) endDate = new Date(moment(startDate, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD"))
      else endDate = new Date(moment(req.query.endDate, "YYYY-MM-DD"))
      if(req.query.fetchBy.toLowerCase()==="BirthDate".toLowerCase()){
        if(req.query.month)
          query = { "$expr": { "$eq": [{ "$month": {date:"$dob",timezone:CURRENT_TIME_ZONE} }, Number(req.query.month)] } } 
        else{
          query = { "$expr":{$and:[{"$eq": [{ "$month": {date:"$dob",timezone:CURRENT_TIME_ZONE} }, startDate.getMonth()+1]},{"$eq": [{ "$dayOfMonth": {date:"$dob",timezone:CURRENT_TIME_ZONE}}, startDate.getDate()]}] } } 
        }
      }
      else if(req.query.fetchBy.toLowerCase()==="HireDate".toLowerCase()){
        if(req.query.month)
          query = { "$expr": { "$eq": [{ "$month": {date:"$hireDate",timezone:CURRENT_TIME_ZONE} }, Number(req.query.month)] } } 
        else{
          query = { "$expr":{$and:[{"$eq": [{ "$month": {date:"$hireDate",timezone:CURRENT_TIME_ZONE} }, startDate.getMonth()+1]},{"$eq": [{ "$dayOfMonth": {date:"$hireDate",timezone:CURRENT_TIME_ZONE}}, startDate.getDate()]}] } } 
        }
      }
      else throw new Error("Invalid value in 'fetchBy' query param. Accepted Values are 'BirthDate' and 'HireDate'"); 
      let pipeline = [
        {
          $match: {...query } 
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
          $project:{
            "id": 1,
            employeeName: {
              $concat: ["$firstName", " ", "$lastName"],
            },
            "file":1,
            "dob": 1,
            "hireDate": 1,
            "uuid": 1,
            designation: {
              $ifNull: [
                "$designationData.name",
                "$designation",
              ],
            }
          }
        }
      ]
      // call method to service
      let result = await EmployeeService.findEmployeesAgg(pipeline, req);
      result.sort((a,b)=>req.query.fetchBy.toLowerCase()==="BirthDate".toLowerCase()?new Date(a.dob).getDate()-new Date(b.dob).getDate():new Date(a.hireDate).getDate()-new Date(b.hireDate).getDate());
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

      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }

  updateAllEmployee = async (req, res) => {
    try {
      console.log("Upload and update Employee, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await EmployeeService.updateAllEmployee(data, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  
  fetchEmployeesTeam = async (req, res, next) => {
    try {
      console.error('Find User Hierarchy, Data By: ' + JSON.stringify(req.query))
      if (!req.query.employeeUUID) throw new Error('employeeUUID is required.')

      // call method to service
      let result = await EmployeeService.findUserTeamByUUID(req.query.employeeUUID, req.query.managerUUID,req);
      
      return res.status(200).send(result);
    } catch (error) {
      console.error(error)
      apiResponse.errorResponse(res, error.message)
    }
  }
  
  updateProbationConfirmation = async (req, res, next) => {
    try {
      console.log("Update Employees Probation, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await EmployeeService.updateProbationConfirmation(data, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
  
  fetchProbationEmployee = async (req, res, next) => {
    try {
      console.log("Get Active Probation Employees ");
      const todayDate = new Date()
      let dueByTwoDays;
      let nextTwoDays;
      const companyName = req.subdomain
      const DB = await switchDB(companyName, probationControlSetupSchema)
      const probationControlSetupModel = await getDBModel(DB, 'probationControlSetup')
      const probationControlData =  await probationControlSetupModel.findOne().lean();
      if(probationControlData && probationControlData?.remindAdminPrior != undefined && probationControlData?.postDateRemaindersAfterEvery != undefined) {
        dueByTwoDays = new Date(new Date().setDate(new Date().getDate() - probationControlData?.remindAdminPrior)).toISOString()
        nextTwoDays = new Date(new Date().setDate(new Date().getDate() +  probationControlData?.postDateRemaindersAfterEvery )).toISOString()
      } else {
        dueByTwoDays = new Date(new Date(new Date().setDate(new Date().getDate() - 2)).toISOString())
        nextTwoDays = new Date(new Date(new Date().setDate(new Date().getDate() + 2 )).toISOString())
      }
      dueByTwoDays = moment(dueByTwoDays, "YYYY-MM-DD").format("YYYY-MM-DD")

      nextTwoDays = moment(nextTwoDays, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD")
      let pipeline = 
      [
        {
          $match: {
            isActive: true,
            jobStatus: "Probation",
            $expr: {
              $and: [
                {
                  $gte: [
                    "$probationDate",
                    dueByTwoDays,
                  ],
                },
                {
                  $lte: [
                    "$probationDate",
                    nextTwoDays,
                  ],
                },
              ],
            },
          },
        },
      ]

      // call method to service
      let resp = await EmployeeService.findEmployeesAgg(pipeline, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }

  attritionEmployees = async (req, res, next) => {
    try {

      const FIRST_MONTH = 1
      const LAST_MONTH = 12
      const MONTHS_ARRAY = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

    
      // const startDate = new Date(moment(req.body.startDate, "YYYY-MM-DD"))
      // const endDate =   new Date(moment(req.body.endDate, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD"))
   
      let endDate = new Date(req.body.endDate)
      let startDate = new Date(req.body.startDate)

      if (!Object.keys(req.body).length === 0)
        throw new Error("No data found for filter.");
        let projection = {}
        let query = {};
        let lookups = [];
        let reportHeader=[];
        const reportType = req.body?.reportType
        
        if(req.body?.reportType == "Attrition") {
          projection = {
            sNo:"$employee.sNo",
            id: "$employee.id",
          }

          if (req.body.department != undefined) {
            query.department = { $in: req.body.department };
          }
          if (req.body.location != undefined) {
            query.location = { $in: req.body.location };
          }
          if (req.body.designation != undefined) {
            query.designation = { $in: req.body.designation };
          }
          if (req.body.managerUUID != undefined) {
            query.managerUUID = { $in: req.body.managerUUID };
          }

          if(req.body?.reportBy== "Department") {
            projection.department = {
              $ifNull: ["$departmentData.name", "$department"],
            }
            projection.departmentId = "$departmentData.id"
            
          }

          if(req.body?.reportBy== "Location") {
            projection.locationName = {
              $ifNull: ["$locationData.locationName", "$locationData"],
            }
            projection.locationId = "$locationData.locationId"
            
          }
          if(req.body?.reportBy== "Manager") {
            projection.managerUUID = "$managerData.id",
            projection.managerName = {
              $concat: ["$managerData.firstName", " ", "$managerData.lastName"],
            }
          }
          
          if(req.body?.exportData) {
            reportHeader.push(
              { label: "Sl. No.", key: "SNo" },
              { label: "ID", key: "id" },
              { label: "Report_BY", key: "reportBy" },
              { label: "Frequency", key: "frequency" }
            );
          }
          
          const companyName = req.subdomain
          const DB = await switchDB(companyName, actionSchemas)
          const actionModel = await getDBModel(DB, 'action')
          let SepAction = await actionModel.findOne({actionCode: "SEP"}, {_id:0, actionCode :1}).lean()
          
          //To Calculate Employees Left:
          const DBHistory = await switchDB(companyName, employeeInfoHistorySchema);
          const employeeInfoHistoryModel = await getDBModel(
            DBHistory,
            "employeeInfoHistory"
          );
          let frequency = ""
          if(req.body.frequency == "Monthly") {
            frequency = "month"
          } else if(req.body.frequency == "Quarterly") {
            frequency = "quarter"
          } else if(req.body.frequency == "Yearly") {
            frequency = "year"
          }

          const array  =  await EmployeeService.getStartEndDates(startDate, endDate, frequency);
          let leftCountsArray = []
          let existCountsArray = []
          let finalResult = []
          for (const element of array) {
            
          
            let pipelineForLeftEmployee = [
              {
                $match : {
                  $expr: {
                    $and: [
                      {$eq : ["$type", "EmployeeJobDetails"]},
                      {$eq : ["$isDeleted", false]},
                      {$eq : ["$historyObject.action", SepAction.actionCode]},
                    ]
                  }
                }
              },
              { $group: {
                _id: { $dateTrunc: { date: "$effectiveDate", unit: frequency } },
                total: { $count: {} }
              }},
              { 
                $match: {  
                  _id: { $gte: element.startDate, $lte: element.endDate }
                }
              },
              { 
                $sort:{
                  _id: 1
                }
              }
            ]

            const leftCounts = await employeeInfoHistoryModel.aggregate(pipelineForLeftEmployee);
            console.log("leftCounts" , leftCounts)
            leftCountsArray.push(leftCounts)
           
          
            //To Calculate Avg. No of Employees:
            let pipelineForexistEmployee = []
            let convertedStartDate = commonUtils.convertDateToUTC(
              element.startDate
            )
            let convertedEndDate = commonUtils.convertDateToUTC(
              element.endDate
            )
             pipelineForexistEmployee = [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(convertedStartDate),
                    $lte: new Date(convertedEndDate),
                  }
                }
              },
              {
                $addFields:
                  /**
                   * newField: The new field name.
                   * expression: The new field expression.
                   */
                  {
                    changedDate: {
                      $dateFromParts: {
                        year: {
                          $year: "$createdAt",
                        },
                        month: {
                          $month: "$createdAt",
                        },
                        day: {
                          $dayOfMonth: "$createdAt",
                        },
                        hour: 0,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                      },
                    },
                  },
              },
              {
                $group:
                  /**
                   * _id: The id of the group.
                   * fieldN: The first field name.
                   */
                  {
                    _id: {
                      month: {
                        $month: "$createdAt",
                      },
                      year: {
                        $year: "$createdAt",
                      },
                    },
                    startDateEmployeeCount: {
                      $sum: {
                        $cond: [
                          {
                            $eq: [
                              "$changedDate",
                              new Date(
                                element.startDate
                              ),
                            ],
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
                            $eq: [
                              "$changedDate",
                              new Date(
                                element.endDate
                              ),
                            ],
                          },
                          1,
                          0,
                        ],
                      },
                    },
                  },
              },
            ]
          
          
            const existCounts = await EmployeeService.findMultipleEmployees(pipelineForexistEmployee, req);
            console.log("existCounts > " , existCounts)
            existCountsArray.push(existCounts)

            //finalResult[element.startDate]  =  (leftCounts[0]?.total ?? 0) / (existCounts[0]?.total ?? 0 *100)
          };
          // leftCounts / existCounts *100



          let data = {}
          let savedDownloadResults = []
          if(reportType && req.body?.exportData) {
          savedDownloadResults = await downloadResultsService.create(
              data = { 
                type  : reportType,
                downloadedBy  : req.body?.downloadedBy,
                status : "In Progress",
                downloadedData: [],
                reportHeader:reportHeader
              },
              req
            )
          }


          const pipeline = [
            
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
                from: "employees",
                localField: "managerUUID",
                foreignField: "id",
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
              $project: {
                ...projection,
                _id: 0,
                uuid: 1
              }
            }
          ];

          let result = await EmployeeService.findMultipleEmployees(pipeline, req);

      
          if(reportType && req.body?.exportData && savedDownloadResults) {
            result.map((record,index)=>{
              record['SNo']=index+1
            })
            await downloadResultsService.update(
              { 
                uuid : savedDownloadResults[0].uuid,
                downloadedBy  : req.body?.downloadedBy,
                status : "Completed",
                downloadedData: result
              },
              req
            )
          }

          if (!result) {
            return res.status(404).send("Employee not found in the database");
          }
          result
          return res.status(200).send(result);
        }
      
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
  fetchNonDirectIndirectEmployees = async(req, res, next) => {
    try{

      let query={
        uuid:{$eq:req.params.uuid}
      }
      let pipeline = [
        {
          $match: {...query } 
        },
        {
          $graphLookup: {
            from: 'employee',
            startWith: '$uuid',
            connectFromField: 'uuid',
            connectToField: 'managerUUID',
            as: 'all_reportees',
          }
        },
        
        {
          $project:{
            uuid:1,
            reporteeUUIDS:"$all_reportees.uuid"
          }
        }
      ]
      let directIndirectEmployees = await EmployeeService.findEmployeesAgg(pipeline,req);
      console.log(directIndirectEmployees)
      const uuidArray=directIndirectEmployees[0].reporteeUUIDS;
      uuidArray.push(directIndirectEmployees[0].uuid)
      const reqPipeLine=[
        {
          $match: {
            uuid:{$nin:uuidArray}
          }
        },
        {
          $project:{
            _id:0,
            uuid:1,
            employeeName:{
              $concat: ["$firstName", " ", "$lastName"],
            },
            employeeID:"$id"
          }
        }
      ]
      console.log(reqPipeLine)
      let result = await EmployeeService.findEmployeesAgg(reqPipeLine,req);
      console.log(result.length)
      return res.status(200).send(result);      
    }catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }

}

module.exports = new Employee();
