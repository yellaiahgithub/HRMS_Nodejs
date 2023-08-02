const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController.js");

// Place your user routes here
router.post("/", bankController.createBank);
router.get("/", bankController.findAll);
router.get("/by", bankController.findBankByIdOrName);
router.get("/fetchBanksWithBranches", bankController.findBankWithBranches);

module.exports = router;
