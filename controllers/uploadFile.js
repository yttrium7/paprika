var config = require('../config/config');

var path = require('path');
var fs = require('fs');
var aws = require('aws-sdk');

const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config.region = 'us-east-2';
aws.config.update({ accessKeyId: config.AWS_KEY_ID, secretAccessKey: config.AWS_SECRET_KEY });
var s3 = new aws.S3();

exports.uploadFile = function(key, path, ){

    var data = fs.readFileSync(path);

    const s3Params = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: imgData,
        Expires: 10000,
        ContentType: files.postImg.type,
        ACL: 'public-read'
    };

    s3.putObject(s3Params,(err, data) => {
        if(err){
            console.log(err);
        }
    });
}