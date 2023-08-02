const express = require('express')
const router = express.Router()
const EducationController = require('../controllers/educationController')


// Place your user routes here
router.post('/', EducationController.createEducation)
router.get('/byEmployeeUUID', EducationController.findEducationById)
router.patch('/', EducationController.updateEducation)
router.delete('/', EducationController.deleteEducationDetail)


module.exports = router
