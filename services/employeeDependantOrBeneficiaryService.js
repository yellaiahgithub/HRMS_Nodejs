const {
  switchDB,
  getDBModel,
  employeeDependantOrBeneficiarySchema,
  employeeSchema,
  uploadResultsSchema,
} = require("../middlewares/switchDB");
const employeeDependantOrBeneficiaryUtils = require("../utils/employeeDependantOrBeneficiaryUtils");
var moment = require("moment"); // require

class EmployeeDependantOrBeneficiaryService {
  constructor() {}

  createEmployeeDependantOrBeneficiary = async (data, req, res) => {
    try {
      console.log("Data for employeeDependantOrBeneficiary create", data);
      const companyName = req.subdomain;
      const companyDB = await switchDB(
        companyName,
        employeeDependantOrBeneficiarySchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        companyDB,
        "employeeDependantOrBeneficiary"
      );
      const savedEmployeeDependantOrBeneficiary =
        await employeeDependantOrBeneficiaryModel.insertMany([data], {
          runValidators: true,
        });
      return savedEmployeeDependantOrBeneficiary;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateEmployeeDependantOrBeneficiary = async (data, req, res) => {
    try {
      console.log("Data for employeeDependantOrBeneficiary update", data);
      const companyName = req.subdomain;
      const companyDB = await switchDB(
        companyName,
        employeeDependantOrBeneficiarySchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        companyDB,
        "employeeDependantOrBeneficiary"
      );
      return await employeeDependantOrBeneficiaryModel.updateOne(
        { _id: data._id },
        { $set: data },
        { upsert: false }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const companyName = req.subdomain;
      const companyDB = await switchDB(
        companyName,
        employeeDependantOrBeneficiarySchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        companyDB,
        "employeeDependantOrBeneficiary"
      );
      return await employeeDependantOrBeneficiaryModel.find();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmployeeDependantOrBeneficiary = async (query, req, res) => {
    try {
      console.log(
        "Get employeeDependantOrBeneficiary, Data By: " + JSON.stringify(query)
      );
      const companyName = req.subdomain;
      const companyDB = await switchDB(
        companyName,
        employeeDependantOrBeneficiarySchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        companyDB,
        "employeeDependantOrBeneficiary"
      );
      return await employeeDependantOrBeneficiaryModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (pipeline, req) => {
    try {
      console.log(
        "Get employeeDependantOrBeneficiary, Data By: " +
          JSON.stringify(pipeline)
      );
      const companyName = req.subdomain;
      const companyDB = await switchDB(
        companyName,
        employeeDependantOrBeneficiarySchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        companyDB,
        "employeeDependantOrBeneficiary"
      );
      return await employeeDependantOrBeneficiaryModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  delete = async (query, req, res) => {
    try {
      const companyName = req.subdomain;
      const companyDB = await switchDB(
        companyName,
        employeeDependantOrBeneficiarySchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        companyDB,
        "employeeDependantOrBeneficiary"
      );
      // find and update record in mongoDB
      return await employeeDependantOrBeneficiaryModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  createAllDependants = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      const forValidationOnly = data.forValidationOnly
        ? data.forValidationOnly
        : "true";
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const allEmployees = await employeeModel.find().lean();

      const DependantDB = await switchDB(
        req.subdomain,
        employeeDependantOrBeneficiarySchema
      );
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        DependantDB,
        "employeeDependantOrBeneficiary"
      );
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      const allDependants = await employeeDependantOrBeneficiaryModel
        .find({ type: "Dependant" })
        .lean();
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "Employee_Id" },
        {
          label: "Relationship_with_Employee",
          key: "Relationship_with_Employee",
        },
        { label: "First_Name", key: "First_Name" },
        { label: "Middle_Name", key: "Middle_Name" },
        { label: "Last_Name", key: "Last_Name" },
        { label: "Gender", key: "Gender" },
        { label: "Marital_Status", key: "Marital_Status" },
        {
          label: "Date_Of_Birth(DD/MM/YYYY)",
          key: "Date_Of_Birth(DD/MM/YYYY)",
        },
        { label: "Age_in_Years", key: "Age_in_Years" },
        { label: "Address_Line_One", key: "Address_Line_One" },
        { label: "Address_Line_Two", key: "Address_Line_Two" },
        { label: "Country", key: "Country" },
        { label: "State", key: "State" },
        { label: "City", key: "City" },
        { label: "Pin_Code", key: "Pin_Code" },
        { label: "Is_Disabled", key: "Is_Disabled" },
        { label: "Is_Student", key: "Is_Student" }
      );
      let uploadingData = {
        type: "Dependant",
        uploadedBy: "namya",
        fileName: data.fileName,
        errorFileName: data.fileName,
        status: "InProgress",
        uploadedData: data.data,
        createdAt: new Date(),
        csvHeader: CSVHeader,
      };
      let createUploadResult;
      if (forValidationOnly == "false" || forValidationOnly == false) {
        createUploadResult = await uploadResultsModel.insertMany(
          [uploadingData],
          {
            runValidators: true,
          }
        );
      }
      const mappedUploadingData = new Map();
      for (let i = 0; i < data.data?.length > 0; i++) {
        const dependant = data.data[i];
        if (mappedUploadingData.get(dependant.Employee_Id)) {
          mappedUploadingData.set(dependant.Employee_Id, [
            ...mappedUploadingData.get(dependant.Employee_Id),
            { ...dependant, index: i },
          ]);
        } else {
          mappedUploadingData.set(dependant.Employee_Id, [
            { ...dependant, index: i },
          ]);
        }
      }
      const mappedExistingData = new Map();
      for (let i = 0; i < allDependants?.length > 0; i++) {
        const dependant = allDependants[i];
        if (mappedExistingData.get(dependant.employeeUUID)) {
          mappedExistingData.set(dependant.employeeUUID, [
            ...mappedExistingData.get(dependant.employeeUUID),
            dependant,
          ]);
        } else {
          mappedExistingData.set(dependant.employeeUUID, [dependant]);
        }
      }

      for (let i = 0; i < data.data?.length > 0; i++) {
        const dependant = data.data[i];
        const empUUID = allEmployees.find(
          (e) => e.id == dependant.Employee_Id
        )?.uuid;
        console.log("processing the record: ", i + 1);
        dependant.employeeUUID=empUUID;
        const errors =
          await employeeDependantOrBeneficiaryUtils.validateDependant(
            dependant,
            allEmployees,
            mappedUploadingData,
            mappedExistingData,
            i
          );
        if (errors.length > 0) {
          dependant.errors = errors;
          const errorData = { ...dependant };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else if (forValidationOnly == "false" || forValidationOnly == false) {
          try {
            const dependantData = {
              ...dependant,
              type: "Dependant",
              name: (
                dependant.First_Name +
                (dependant.Middle_Name ? " " + dependant.Middle_Name : "") +
                (dependant.Last_Name ? " " + dependant.Last_Name : "")
              ).trim(),
              employeeUUID: empUUID,
              relationWithEmployee: dependant.Relationship_with_Employee,
              gender: dependant.Gender,
              age: dependant.Age_in_Years,
              addressLineOne: dependant.Address_Line_One,
              addressLineTwo: dependant.Address_Line_Two,
              country: dependant.Country,
              state: dependant.State,
              city: dependant.City,
              pinCode: dependant.Pin_Code,
              maritalStatus: dependant.Marital_Status,
            };
            dependantData.isStudent =
              dependant.Is_Student?.toLowerCase() === "true".toLowerCase();
            dependantData.disabled =
              dependant.Is_Disabled?.toLowerCase() === "true".toLowerCase();
            dependantData["dob"] = new Date(
              moment(dependant["Date_Of_Birth(DD/MM/YYYY)"], "DD/MM/YYYY")
            );
            const savedDependant =
              await employeeDependantOrBeneficiaryModel.insertMany(
                [dependantData],
                { runValidators: true }
              );
            if (savedDependant.length > 0) {
              sucessList.push(dependantData);
              sucessfullyAddedCount++;
              console.log(savedDependant);
            }
          } catch (error) {
            const errorData = { ...dependant };
            errorData.errors = error?.message;
            errorList.push(errorData);
            errorCount++;
            console.log("error occured while saving record", i + 1);
            console.log("err", error);
          }
        }
        console.log("processed record", i + 1);
      }
      if (forValidationOnly == "false" || forValidationOnly == false) {
        const updateUploadResult = await uploadResultsModel.updateOne(
          { _id: createUploadResult[0]._id },
          {
            $set: {
              status:
                sucessfullyAddedCount == data.data.length
                  ? "Sucess"
                  : "Rejected",
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
  createAllBeneficiaries = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const allEmployees = await employeeModel.find().lean();

      const BeneficiaryDB = await switchDB(
        req.subdomain,
        employeeDependantOrBeneficiarySchema
      );
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const employeeDependantOrBeneficiaryModel = await getDBModel(
        BeneficiaryDB,
        "employeeDependantOrBeneficiary"
      );
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "employeeId" },
        { label: "Beneficiary_Type", key: "beneficiaryType" },
        { label: "Name", key: "name" },
        { label: "Address_Line_One", key: "addressLineOne" },
        { label: "Address_Line_Two", key: "addressLineTwo" },
        { label: "Country", key: "country" },
        { label: "State", key: "state" },
        { label: "City", key: "city" },
        { label: "Pin_Code", key: "pinCode" },
        { label: "Is_Disabled", key: "disabled" },
        { label: "Is_Student", key: "isStudent" }
      );
      let uploadingData = {
        type: "Beneficiary",
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
        const beneficiary = data.data[i];

        console.log("processing the record: ", i + 1);
        const errors =
          await employeeDependantOrBeneficiaryUtils.validateBeneficiary(
            beneficiary,
            allEmployees
          );
        if (errors.length > 0) {
          const errorData = { ...beneficiary };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            const beneficiaryData = {
              ...beneficiary,
              type: "Beneficiary",
            };
            beneficiaryData.isStudent =
              beneficiary.isStudent?.toLowerCase() === "true".toLowerCase();
            beneficiaryData.disabled =
              beneficiary.disabled?.toLowerCase() === "true".toLowerCase();

            const savedBeneficiary =
              await employeeDependantOrBeneficiaryModel.insertMany(
                [beneficiaryData],
                { runValidators: true }
              );
            if (savedBeneficiary.length > 0) {
              sucessList.push(beneficiaryData);
              sucessfullyAddedCount++;
            }
          } catch (error) {
            const errorData = { ...beneficiary };
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

module.exports = new EmployeeDependantOrBeneficiaryService();
