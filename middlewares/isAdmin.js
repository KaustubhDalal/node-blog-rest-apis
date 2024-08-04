const isAdmin = (req,res,next) =>{
  try{
    //role 1 is super admin, 2 is admin
    if(req.user && req.user.role === 1 || req.user.role == 2){
      next();
    }else{
      res.code = 401;
      throw new Error("Permission denied");
    }
  }catch(error){
    next(error);
  }
}

module.exports = isAdmin;