const express = require('express')

const router = express.Router()
const CompanyPolicyController = require('../controllers/companyPolicyController.js')

// Place your user routes here
router.post('/', CompanyPolicyController.createCompanyPolicy)
router.get('/', CompanyPolicyController.findAll)

module.exports = router
