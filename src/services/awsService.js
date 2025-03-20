const AWS = require('aws-sdk');

require('dotenv').config('../config/env/.')
const endpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT);

const s3 = new AWS.S3({
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // region: process.env.AWS_REGION
  }
});

// upload
const upload = async (path, buffer, mimetype) => {
  const exists = await doesObjectExist(process.env.AWS_BUCKET_NAME, path);
  
  if (exists) {
    await deleteFile(path);
  }
  
  const image = await s3.upload({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path,
    Body: buffer,
    ContentType: mimetype
  }).promise();

  return {
    url: image.Location,
    path: image.key
  }
}

// delete
const deleteFile = async (url) => {
  const key = extractKey(url);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };

  await s3.deleteObject(params).promise();
}

// does object exist
const doesObjectExist = async (path) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path
    };

    const data = await s3.headObject(params).promise();
    return data;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

// extract the key
const extractKey = (url) => {
  const urlParts = url.split('/');
  return urlParts.slice(3).join('/');
}

module.exports = { 
  s3,
  upload,
  deleteFile,
}