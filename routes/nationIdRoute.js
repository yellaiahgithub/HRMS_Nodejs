const express = require('express')

const router = express.Router()
const NationalController = require('../controllers/nationIdController')

// Place your user routes here
router.post('/', NationalController.createNational)
router.patch('/:nationalId', NationalController.updateNational)
router.get('/', NationalController.findAll)
router.get('/by', NationalController.findNationalById)
router.delete('/:uuid', NationalController.deleteNationId)

router.get("/CSVHeader", NationalController.generateCSVHeader);
router.post("/saveAll", NationalController.createAllNationId);

module.exports = router
