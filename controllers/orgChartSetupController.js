const OrgChartSetupService = require("../services/orgChartSetupService");
const apiResponse = require("../helper/apiResponse");

class OrgChartSetup {
  constructor() {}

  findOrgChartSetupByCompanyUUID = async (req, res, next) => {
    try {
      if (!req.params.companyUUID) throw new Error("Company UUID is required.");
      let query = { companyUUID: req.params.companyUUID };
      // call method to service
      let result = await OrgChartSetupService.findOrgChartSetup(query, req);

      if (!result) {
        result = {
          attributesList: [
            { name: "Employee Image", mappingName: "file", isSelected: false },
            { name: "Name", mappingName: "employeeName", isSelected: false },
            {
              name: "Designation",
              mappingName: "designation",
              isSelected: false,
            },
            { name: "Location", mappingName: "location", isSelected: false },
            {
              name: "Department",
              mappingName: "department",
              isSelected: false,
            },
            {
              name: "Email ID",
              mappingName: "employeeEmail",
              isSelected: false,
            },
            { name: "Phone", mappingName: "employeePhone", isSelected: false },
          ],
          employeeTypeList: [
            { name: "Employee", isSelected: false },
            {
              name: "Contractor",
              isSelected: false,
            },
            { name: "Intern", isSelected: false },
            {
              name: "Consultant",
              isSelected: false,
            },
          ],
        };
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createOrgChartSetup = async (req, res, next) => {
    try {
      console.log("Create OrgChartSetup, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await OrgChartSetupService.createOrgChartSetup(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  updateOrgChartSetup = async (req, res, next) => {
    try {
      console.log("Update OrgChartSetup, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await OrgChartSetupService.updateOrgChartSetup(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new OrgChartSetup();
