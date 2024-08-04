const { check } = require("express-validator");
const validateEmail = require("./validateEmail");
const mongoose = require("mongoose");

const signupValidator = [
  //checking for is name empty if empty will show message
  check("name").notEmpty().withMessage("Name is required"),

  //checking for is email valid or not,if not valid will show message
  check("email")
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),

  //checking for password with min length 6, if not it will show message
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be 6 characters long.")
    .notEmpty()
    .withMessage("Passowrd is required"),
];

const signinValidator = [
  //checking for is email valid or not,if not valid will show message
  check("email")
    .isEmail()
    .withMessage("Invalid Email")
    .notEmpty()
    .withMessage("Email is required"),

  //checking for password with min length 6, if not it will show message
  check("password").notEmpty().withMessage("password is required"),
];

const emailValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid Email")
    .notEmpty()
    .withMessage("Email is required"),
];

const verifyUserValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid Email")
    .notEmpty()
    .withMessage("Email is required"),

  check("code").notEmpty().withMessage("Code is required"),
];

const recoverPasswordValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid Email")
    .notEmpty()
    .withMessage("Email is required"),

  check("code").notEmpty().withMessage("Code is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be 6 characters long.")
    .notEmpty()
    .withMessage("Passowrd is required")
]

const changePasswordValidtor = [
  check("oldPassword").notEmpty().withMessage("Old Password is required"),
  check("newPassword").notEmpty().withMessage("New Password is required")
]

const updateProfileValidator = [
  check("email").custom(async (email) =>{
    if(email){
      const isValidEmail = validateEmail(email);
      if(!isValidEmail){
        res.code = 400;
        throw new Error("Invalid Email");
      }
    }
  }),

  check("profilePic").custom(async (profilePic) =>{
    if(profilePic && !mongoose.Types.ObjectId.isValid(profilePic)){
      throw "Invalid profile picture";
    }
  })
]

module.exports = { signupValidator, signinValidator, emailValidator,verifyUserValidator,recoverPasswordValidator,changePasswordValidtor,updateProfileValidator };
