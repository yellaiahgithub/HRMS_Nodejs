const express = require('express')

const router = express.Router()
const CustomerController = require('../controllers/customerController')

// Place your user routes here
router.post('/save', CustomerController.createCustomer)
router.put('/update', CustomerController.updateCustomer)
router.get('/', CustomerController.findAll)
router.get('/byId/:uuid', CustomerController.findCustomerById)

module.exports = router
