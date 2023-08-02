const express = require('express')
const router = express.Router()
const WorkExperienceController = require('../controllers/workExperienceController')

// Place your user routes here
router.post('/', WorkExperienceController.createWorkExperience)
router.post("/saveAll", WorkExperienceController.createAllWorkExperiences);
router.get('/byEmployeeUUID', WorkExperienceController.findWorkExperienceById)
router.patch('/', WorkExperienceController.updateWorkExperience)
router.delete('/', WorkExperienceController.deleteWorkExperienceDetail)
router.get("/CSVHeader", WorkExperienceController.generateCSVHeader);


module.exports = router
