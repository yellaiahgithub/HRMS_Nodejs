const express = require('express')

const router = express.Router()
const LocationController = require('../controllers/locationController')

// Place your user routes here
router.post('/', LocationController.createLocation)
router.post("/saveAll", LocationController.createAllLocations);
router.patch('/:locationId', LocationController.updateLocation)
router.get('/', LocationController.findAll)
router.get('/fetchAllLite', LocationController.findAllLite)
router.get('/by', LocationController.findLocationById)
router.get("/CSVHeader", LocationController.generateCSVHeader);

module.exports = router
