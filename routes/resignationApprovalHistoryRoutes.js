const express = require("express");

const router = express.Router();
const ResignationApprovalHistoryController = require("../controllers/resignationApprovalHistoryController");

// Place your user routes here
router.post("/save", ResignationApprovalHistoryController.createResignationApprovalHistory);
router.put("/update", ResignationApprovalHistoryController.updateAndCreateNextHistory);
router.get("/fetch", ResignationApprovalHistoryController.find);

module.exports = router;
