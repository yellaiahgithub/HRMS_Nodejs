const {
  switchDB,
  getDBModel,
  departmentSchema,
  uploadResultsSchema,
  locationSchemas,
  employeeSchema,
  designationSchemas,
} = require("../middlewares/switchDB");
const departmentUtils = require("../utils/departmentUtils");
const autoNumberingService = require("./autoNumberingService");

var moment = require("moment"); // require

class DepartmentService {
  constructor() {}

  createDepartment = async (data, req, res) => {
    try {
      console.log("Data for department create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, departmentSchema);
      const departmentModel = await getDBModel(DB, "department");
      const nextSequence = await autoNumberingService.getNextSequence(
        { type: "DEP" },
        req,
        res
      );

      if (nextSequence != null) {
        data.id = nextSequence;
      }
      const savedDepartment = await departmentModel.insertMany([data], {
        runValidators: true,
      });
      if (nextSequence != null) {
        const temp = await autoNumberingService.updateSequence(
          { type: "DEP" },
          req,
          res
        );
      }
      return savedDepartment;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateDepartment = async (data, req, res) => {
    try {
      console.log("Data for department update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, departmentSchema);
      const departmentModel = await getDBModel(DB, "department");
      return await departmentModel.updateOne(
        { _id: data._id },
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
      const DB = await switchDB(companyName, departmentSchema);
      const departmentModel = await getDBModel(DB, "department");
      return await departmentModel.find().lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findDepartment = async (query, req, res) => {
    try {
      console.log("Get department, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, departmentSchema);
      const departmentModel = await getDBModel(DB, "department");
      return await departmentModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findWithProjection = async (query, req, res) => {
    try {
      console.log("Get department, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, departmentSchema);
      const departmentModel = await getDBModel(DB, "department");
      return await departmentModel.find(query, {_id:0,id:1, uuid:1, name:1}).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (query, req) => {
    try {
      console.log("Get department, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, departmentSchema);
      const departmentModel = await getDBModel(DB, "department");
      return await departmentModel.aggregate(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findDepartmentById = async (query, req, res) => {
    try {
      console.log("Get department, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, departmentSchema);
      const departmentModel = await getDBModel(DB, "department");
      const department = await departmentModel.findOne(query).lean();
      //getAllLocations
      const locationDB = await switchDB(companyName, locationSchemas);
      const locationModel = await getDBModel(locationDB, "locations");
      const allLocations = await locationModel.find({}).lean();

      department.locationDetails = [];
      let deptLocationsCount = department.locations?.length;
      for (let i = 0; i < allLocations.length; i++) {
        const location = allLocations[i];
        const locationDetails = {
          locationId: location.locationId,
          locationName: location.locationName,
        };
        if (deptLocationsCount > 0) {
          const found = department.locations?.find(
            (loc) => loc == location.locationId
          );
          if (found) {
            department.locationDetails.push({
              ...locationDetails,
              preferred: true,
            });
            deptLocationsCount--;
          } else {
            department.locationDetails.push({
              ...locationDetails,
              preferred: false,
            });
          }
        } else {
          department.locationDetails.push({
            ...locationDetails,
            preferred: false,
          });
        }
      }

      return department;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  createAllDepartments = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      const allDepartments = await this.findAll(req);

      //getAllLocations
      const locationDB = await switchDB(req.subdomain, locationSchemas);
      const locationModel = await getDBModel(locationDB, "locations");
      const allLocations = await locationModel.find({ status: true }).lean();

      //getOneToOneDesignations
      const designationDB = await switchDB(req.subdomain, designationSchemas);
      const designationModel = await getDBModel(designationDB, "designation");
      const allDesignations = await designationModel
        .find({
          isOneToOne: true,
          status: true,
        })
        .lean();

      //getActiveEmployees
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const allEmployees = await employeeModel.find({ isActive: true }).lean();

      const DepartmentDB = await switchDB(req.subdomain, departmentSchema);
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const departmentModel = await getDBModel(DepartmentDB, "department");
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      let CSVHeader = [];
      if (!data?.isAutoGeneratedDepartmentId) {
        CSVHeader.push({ label: "Department_Id", key: "id" });
      }
      CSVHeader.push(
        { label: "Department_Name", key: "name" },
        { label: "HOD_Type", key: "hodType" },
        { label: "Employee_Id", key: "employeeId" },
        { label: "Job_Id", key: "jobId" },
        { label: "Locations", key: "locations" },
        { label: "As_Of_Date(DD/MM/YYYY)", key: "asOfDate" }
      );
      let uploadingData = {
        type: "Department",
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
      for (let i = 0; i < data.data?.length > 0; i++) {
        const department = data.data[i];
        department.locationsList =
          department.locations?.length > 0
            ? department.locations.split(",")
            : [];
        console.log("processing the record: ", i + 1);
        const errors = await departmentUtils.validateDepartment(
          department,
          data.data,
          data?.isAutoGeneratedDepartmentId,
          allDepartments,
          allLocations,
          allDesignations,
          allEmployees,
          i
        );
        if (errors.length > 0) {
          const errorData = { ...department };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {

            if(department?.employeeId && allEmployees?.length>0) {
              department.employeeId = allEmployees.find(e => e.id == department?.employeeId)?.uuid
            }
            const departmentData = {
              ...department,
              locations: department.locationsList,
              status: true,
            };
            departmentData["asOfDate"] = new Date(
              moment(department.asOfDate, "DD/MM/YYYY")
            );
            departmentData.hodId =
              department.hodType.toLowerCase() === "None".toLowerCase()
                ? null
                : department.hodType.toLowerCase() === "Employee".toLowerCase()
                ? department.employeeId
                : department.jobId;
            if (data?.isAutoGeneratedDepartmentId) {
              const nextSequence = await autoNumberingService.getNextSequence(
                { type: "DEP" },
                req,
                res
              );
              if (nextSequence != null) {
                departmentData.id = nextSequence;
              }
            }
            const savedDepartment = await departmentModel.insertMany(
              [departmentData],
              { runValidators: true }
            );
            if (savedDepartment.length > 0) {
              if (data?.isAutoGeneratedDepartmentId) {
                const temp = await autoNumberingService.updateSequence(
                  { type: "DEP" },
                  req,
                  res
                );
              }
              sucessList.push(departmentData);
              sucessfullyAddedCount++;
            }
          } catch (error) {
            const errorData = { ...department };
            errorData.errors = error.errors?.code?.properties?.message;
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

module.exports = new DepartmentService();
