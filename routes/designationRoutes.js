const express = require("express");

const router = express.Router();
const DesignationController = require("../controllers/designationController");

// Place your user routes here
router.post("/save", DesignationController.createDesignation);
router.post("/saveAll", DesignationController.createAllDesignations);
router.put("/update", DesignationController.updateDesignation);
router.get("/fetchById/:id", DesignationController.findDesignationById);
//send 'isOneToOne','isCritical','status' as query params for conditional fetch
router.get("/fetchAll", DesignationController.findDesignation);
router.get("/fetchAllLite", DesignationController.findAllLite);

router.get("/CSVHeader", DesignationController.generateCSVHeader);

module.exports = router;
