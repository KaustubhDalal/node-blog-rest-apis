// importing user model
const { User,File } = require("../models");

const hashPassword = require("../utils/hashPassword");
const comparePassword = require("../utils/comparePassword")
const generateToken = require("../utils/generateToken");
const generateCode = require("../utils/generateCode");
const sendEmail = require("../utils/sendEmail");
const { use } = require("../routes/auth");

const singup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const isEmailExist = await User.findOne({email});
    if(isEmailExist){
      res.code = 400;
      throw new Error("Email already exist");
    }

    //hashing normal password here
    const hashedPassword = await hashPassword(password);

    const newUser = new User({ name, email, password : hashedPassword, role });

    await newUser.save();
    res
      .status(201)
      .json({
        code: 201,
        status: true,
        message: "User Registered Successfully!",
      });
  } catch (error) {
    next(error);
  }
};

const signin = async(req,res,next) => {
  try{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    
    if(!user){
      res.code = 401;
      throw new Error("Invalid credentials")
    }
    const match = await comparePassword(password,user.password)
    if(!match){
      res.code = 401;
      throw new Error("Invalid credentials")
    }

    const token = generateToken(user);

    res.status(200).json({code : 200,status : true, message : "User signin successfull.",data : {token}})
  }catch(error){
    next(error)
  }
};

const verifyCode = async (req,res,next) => {
  try{
    const {email} = req.body;
    const user = await  User.findOne({email});
    if(!user){
      req.code = 404;
      throw new Error("User not found")
    }

    if(user.isVerified){
      res.code = 400;
      throw new Error("User already verified")
    }
    //it will return 6 digit code
    const code = generateCode(6);

    user.verificationCode = code;
    await user.save();

    //send email
    await sendEmail({
      emailTo : user.email,
      subject : "Email verification code",
      code,
      content : "verify your account"
    })
    res.status(200).json({code : 200,status : true,message : "User verification code send successfully."})
  }catch(error){
    next(error);
  }
}

const verifyUser = async (req,res,next) =>{
  try{
    const {email,code} = req.body;
    const user = await User.findOne({email});
    if(!user){
      res.code = 404; 
      throw new Error("User not found");
    }

    if(user.verificationCode  !== code){
      res.code = 400;
      throw new Error("Invalid code");
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.status(200).json({code :200,status:true,message : "User verified successfully"});
  }catch(error){
    next(error);
  }
}

const forgotPasswordCode = async (req,res,next) => {
  try{
    //below code creating forgot pass code and saving it for that user if user found.
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      res.code = 404;
      throw new Error("User not found");
    }

    const code = generateCode(6);
    // User.forgotPasswordCode = code;
    user.forgotPasswordCode = code;
    await user.save();

    //below code will send forgot pass mail with code
    await sendEmail({
      emailTo  : user.email,
      subject : "Forgot Password Code",
      code,
      content : "Change your password"
    });

    res.status(200).json({code : 200,status:true,message : "Forgot password code send successfully."})
  }catch(error){

  }
}

const recoverPassword = async(req,res,next) =>{
  try{
    const {email,code,password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      res.code = 404;
      throw new Error("User not found");
    }

    //checking code with db code
    if(user.forgotPasswordCode !== code){
      res.code = 400;
      throw new Error("Invalid code")
    }

    //if code is correct we are hashing new pasword to store it in db
    const hashedPassword = await hashPassword(password);
    //set user's db pass with newly generated hashed password
    user.password = hashedPassword;
    //setting user's forgot password code to null
    user.forgotPasswordCode = null;
    //saving user details
    await user.save();
    res.status(200).json({code:200,status : true,message : "Password Recovered Successfully."})

  }catch(error){
    next(error)
  }
}

const changePassword = async(req,res,next) => {
  try{
    const {oldPassword,newPassword} = req.body;
    const {_id} = req.user;
    const user = await User.findById(_id);
    if(!user){
      res.code = 404;
      throw new Error("User not found");
    }
    
    //comparing password with password in db
    const match = await comparePassword(oldPassword,user.password);

    if(!match){
      res.code = 400;
      throw new Error("Old Password does not matched");
    }

    if(oldPassword === newPassword){
      res.code = 400;
      throw new Error("you are providing old password");
    }
    
    //hashing new passowrd and save it for that user
    const hashedPassword = await hashPassword(newPassword);
    // console.log(hashedPassword)
    //updating user password
    user.password = hashedPassword;
    await user.save();
    //req.user came from the binding of user object with payload in isAuth.js middleware
    // res.json(req.user);
    res.status(200).json({code : 200, status : true,message: "New password updated successfully."})
  }catch(error){
    next(error);
  }
}

const updateProfile = async(req,res,next) =>{
  try{
    const {_id} = req.user;
    const {name,email,profilePic} = req.body;
    //here it was returning whose user object data with all field but i dont wanted these 3 fields data so i removed them when selecting 
    const user = await User.findById(_id).select("-password -verificationCode -forgotPasswordCode");
    if(!user){
      res.code = 404;
      throw new Error("User not found");
    }
    if(email){
      //here we are finding record by mail
      const isUserExist = await User.findOne({email});
      if(isUserExist && isUserExist.email == email && String(user._id) !== String(isUserExist._id)){
        res.code = 400;
        throw new Error("Email already exist");

      }
    }

    if(profilePic){
      const file = await File.findById(profilePic);
      if(!file){
        res.code = 404;
        throw new Error("File not found");
      }
    }

    //setting name,email and profilePic values here in db
    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.profilePic = profilePic;

    if(email){
      user.isVerified = false;
    }
    //saving user details here
    await user.save();
    res.status(200).json({code : 200,status: true,message: "User profile updated successfully",data : {user}});
  }catch(error){
    next(error)
  }
}

const currentUser = async(req,res,next) => {
  try{
    const {_id} = req.user;
    // on below line populate() will return the object in user array we got profilePic : some id,in the populate method we added profilePic id and it return full file object
    const user = await User.findById(_id).select("-password -verificationCode -forgotPasswordCode").populate("profilePic"); 
    if(!user){
      res.code = 404;
      throw new Error("User not found");
    }

    res.status(200).json({code :200,status :true,message : "Get current user successfully.",data:{user    }})
  }catch(error){
    next(error);
  }
}

module.exports = { singup,signin,verifyCode,verifyUser,forgotPasswordCode,recoverPassword,changePassword,updateProfile,currentUser };
