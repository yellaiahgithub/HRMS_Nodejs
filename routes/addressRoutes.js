const express = require('express')

const router = express.Router()
const AddressController = require('../controllers/addressController')

// Place your user routes here
router.post('/', AddressController.createAddress)
router.post("/saveAll", AddressController.createAllEmployeeAddresses);
router.patch('/', AddressController.updateAddress)
router.get('/by/:employeeUUID', AddressController.findAddressById)
router.delete('/', AddressController.deleteAddress)
router.get("/CSVHeader", AddressController.generateCSVHeader);

module.exports = router
