const jwt = require("jsonwebtoken");
const {jwtSecret} = require("../config/keys");

const isAuth = async (req,res,next) => {
  try{
    //spliting Bearer and actual token here a
    const authorization = req.headers.authorization ? req.headers.authorization.split(" ") : [];
    const token = authorization.length > 1 ? authorization[1] : null;
    if(token){
      const payload = jwt.verify(token,jwtSecret);
      //Payload means what we pas as first parameter to the function jwt.sign() in generateToken.js file in utils
      // {
      //   _id: '66aa73a5013b5be35dcc3452',
      //   name: 'kd yopmail',
      //   email: 'kd@yopmail.com',
      //   role: 3,
      //   iat: 1722492282,
      //   exp: 1723097082
      // }

      //here we are bindig payload with the user object
      if(payload){
        req.user = {
          _id : payload._id,
          name : payload.name,
          email : payload.email,
          role : payload.role
        }
        next(); 
      }
      else{
        res.code = 401;
        throw new Error("Unauthorized");
      }
    }else{
      res.code = 400;
      throw new Error("Token is required");
    }
  }catch(error){
    next(error)
  }
}

module.exports = isAuth;