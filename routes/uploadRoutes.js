const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid').v1;
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
  signatureVersion: 'v4',
  region: 'ap-south-1',
});

module.exports = (app) => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;
    const params = {
      Bucket: 'my-blog-bucket-node-app',
      ContentType: 'image/jpeg',
      Key: key,
      Expires: 60,
    };

    const url = s3.getSignedUrl('putObject', params);

    res.send({ key, url });
  });
};
