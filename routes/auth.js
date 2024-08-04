const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const {signupValidator,signinValidator,emailValidator,verifyUserValidator,recoverPasswordValidator,changePasswordValidtor,updateProfileValidator} = require('../validators/auth');
const isAuth = require("../middlewares/isAuth");
const validate = require('../validators/validate')

router.post('/signup',signupValidator,validate,authController.singup);
router.post('/signin',signinValidator,validate,authController.signin);
router.post('/send-verification-email',emailValidator,validate,authController.verifyCode);
router.post('/verify-user',verifyUserValidator,validate,authController.verifyUser);
router.post('/forgot-password-code',emailValidator,validate,authController.forgotPasswordCode);
router.post('/recover-password',recoverPasswordValidator,validate,authController.recoverPassword);
router.put('/change-password',changePasswordValidtor,validate,isAuth,authController.changePassword);
router.put('/update-profile',updateProfileValidator,validate,isAuth,authController.updateProfile);
router.get("/current-user",isAuth,authController.currentUser);
module.exports = router;