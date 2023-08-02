const express = require('express')

const router = express.Router()
const LoginAdminController = require('../controllers/loginAdminController')

// Place your user routes here
router.post('/', LoginAdminController.loginAdmin)

module.exports = router
