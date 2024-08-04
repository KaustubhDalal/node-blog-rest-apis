const mongoose = require('mongoose');
const { connectionUrl } = require("../config/keys");

const connectMongodb = async () => {
  try{
    await mongoose.connect(connectionUrl).then(() =>{
    console.log('Mongoose DB Connection success')
  })
  }catch(error){
    console.log(error.message);
  }
}

module.exports = connectMongodb;