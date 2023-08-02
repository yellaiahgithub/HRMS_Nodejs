const express = require("express");

const router = express.Router();
const SourceBankController = require("../controllers/sourceBankController");

// Place your user routes here
router.post("/save", SourceBankController.createSourceBank);
router.put("/update", SourceBankController.updateSourceBank);
router.get("/fetchAll", SourceBankController.findAll);
router.get("/fetchAllSourceTargetBanks", SourceBankController.findAllSourceTargetBanks);
router.get("/fetchByUUID/:uuid", SourceBankController.findSourceBankByUUID);
//send search data in query param 'data'
router.get("/search", SourceBankController.searchSourceBank);
router.delete("/delete", SourceBankController.deleteSourceBank);

module.exports = router;
