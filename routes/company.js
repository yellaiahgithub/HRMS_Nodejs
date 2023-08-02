const express = require('express')

const router = express.Router()
const CompanyController = require('../controllers/companyController')

// Place your user routes here
router.post('/', CompanyController.createCompany)
router.patch('/:companyId', CompanyController.updateCompany)
router.get('/', CompanyController.findAll)
router.get('/by', CompanyController.findCompanyByIdOrName)

module.exports = router
