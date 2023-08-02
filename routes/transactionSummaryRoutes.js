const express = require("express");

const router = express.Router();
const TransactionSummaryController = require("../controllers/transactionSummaryController");

// Place your user routes here
router.post("/save", TransactionSummaryController.createTransactionSummary);
router.put("/update", TransactionSummaryController.updateTransactionSummary);
router.get("/fetchAll", TransactionSummaryController.findAll);
router.post("/fetchByApproverType/:type", TransactionSummaryController.findTransactionSummary);
router.delete("/delete", TransactionSummaryController.deleteTransactionSummary);

module.exports = router;
