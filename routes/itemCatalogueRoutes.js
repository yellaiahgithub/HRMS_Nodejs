const express = require("express");

const router = express.Router();
const ItemCatalogueController = require("../controllers/itemCatalogueController");

// Place your user routes here
router.post("/save", ItemCatalogueController.createItemCatalogue);
router.post("/saveAll", ItemCatalogueController.createAllItemCatalogues);
router.put("/update", ItemCatalogueController.updateItemCatalogue);
router.get("/fetchAll", ItemCatalogueController.findAll);
router.get("/fetchById/:id", ItemCatalogueController.findItemCatalogueById);
router.get("/fetchByType/:type", ItemCatalogueController.findItemCatalogueByType);
router.get("/search", ItemCatalogueController.searchItemCatalogue);
router.delete("/delete", ItemCatalogueController.deleteItemCatalogue);

module.exports = router;
