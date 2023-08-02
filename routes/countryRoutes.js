const express = require("express");

const router = express.Router();
const CountryController = require("../controllers/countryController");

// Place your user routes here
router.post("/save", CountryController.createCountry);
router.put("/update", CountryController.updateCountry);
router.get("/fetchAll", CountryController.findAll);
router.get("/fetchByCountryName/:name", CountryController.findCountryByName);
router.delete("/delete", CountryController.deleteCountry);

module.exports = router;
