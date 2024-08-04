const {PutObjectCommand,S3Client,GetObjectCommand,DeleteObjectCommand} = require("@aws-sdk/client-s3");
const {awsRegion,awsAccessKey,awsSecretAccessKey,awsBucketName} = require("../config/keys");
const generateCode = require("../utils/generateCode");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

//s3 bucket setup
const client = new S3Client({
  region : awsRegion,
  credentials : {
    accessKeyId : awsAccessKey,
    secretAccessKey : awsSecretAccessKey,
  }
});

const uploadFileToS3 = async ({file,ext}) =>{
  // we are generating a random key here to pass in params
  //some_randome_number_some_random_number.ext
  const Key = `${generateCode(12)}_${Date.now()}${ext}`;

  // params object should look like below and its keys first letter should be in capital
  const params = {
    Bucket : awsBucketName,
    Body : file.buffer,
    Key : Key,
    ContentType : file.mimetype
  };

  const command = new PutObjectCommand(params);
  try{
    await client.send(command);
    return Key;
  }catch(error){
    console.log(error);
  }
};

const signedUrl = async (Key) => {
  const params = {
    Bucket : awsBucketName,
    Key : Key
  };

  const command = new GetObjectCommand(params);

  try{
    const url = await getSignedUrl(client,command,{expiresIn : 60}); // signed url will get expired in 60 seconds
    return url;
  }catch(error){
    console.log(error);
  }
}

const deleteFileFromS3 = async (Key) =>{
  const params = {
    Bucket : awsBucketName,
    Key
  };

  const command = new DeleteObjectCommand(params); // It will delete file form S3

  try{
    await client.send(command);
    return;
  }catch(error){
    console.log(error);
  }
}

module.exports = {uploadFileToS3,signedUrl,deleteFileFromS3};