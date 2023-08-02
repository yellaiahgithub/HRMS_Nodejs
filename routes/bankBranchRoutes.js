const express = require("express");
const router = express.Router();
const bankBranchController = require("../controllers/bankBranchController.js");

// Place your user routes here
router.post("/", bankBranchController.createBankBranch);
router.get("/", bankBranchController.findAll);
router.get("/by", bankBranchController.findBankBranchesBy);

module.exports = router;
