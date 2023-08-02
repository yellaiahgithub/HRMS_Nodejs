const express = require('express')
const router = express.Router()
const Auth = require('../controllers/authController')

router.post('/resetPassword', Auth.resetPassword)
router.post('/resetPasswordByToken', Auth.resetPasswordByToken)
router.post('/user', Auth.verifyUser)

module.exports = router
