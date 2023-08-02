const express = require("express");

const router = express.Router();
const OrgChartSetupController = require("../controllers/orgChartSetupController");

// Place your user routes here
router.post("/save", OrgChartSetupController.createOrgChartSetup);
router.put("/update", OrgChartSetupController.updateOrgChartSetup);
router.get("/:companyUUID", OrgChartSetupController.findOrgChartSetupByCompanyUUID);

module.exports = router;
