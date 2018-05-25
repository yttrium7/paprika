var ClassModel = require('../models/class.model');
var TopicModel = require('../models/topic.model');
var UserModel = require('../models/user.model');

var formidable = require('formidable');
var path = require('path');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-2';


exports.editProfile = function(req, res){

    var form = new formidable.IncomingForm();
    form.uploadDir = path.dirname(__dirname) + '/public/avatars/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;

    const s3 = new aws.S3();
    

    var bio = req.body.editBio;

    if(bio){
        UserModel.update({"_id":req.session.user._id}, {$set:{"bio":bio}}, function(err){
            if(err){
                req.flash('error','Update bio error');
                return res.redirect('/profile');
            }
            res.redirect("/profile");
        });
    }else{
        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log(err);
                req.flash('error','Uplaod new avatar error');
                return res.redirect('/profile');
            }

            console.log("the avatar file is : ",files);

            var avatar = files.avatar.path.split(path.sep).pop();
            const s3Params = {
                Bucket: "paprica-action",
                Key: avatar,
                Expires: 10000,
                ContentType: files.avatar.type,
                ACL: 'public-read'
            };

            s3.getSignedUrl('putObject', s3Params, (err, data) => {
                console.log("the s3 signed url data is :",data);
                if(err){
                  console.log(err);
                  return res.end();
                }
                const returnData = {
                  signedRequest: data,
                  url: `https://paprica-action.s3.amazonaws.com/${avatar}`
                };
                returnData = JSON.stringify(returnData);
                
                UserModel.update({"_id":req.session.user._id}, {$set:{"avatar":returnData.url}}, function(err){
                    if(err){console.log('error ','user avatar update')}
                });
                res.redirect('/profile');
                //res.end();
            });
        });
    }
};

exports.profile = function(req,res) {

    console.log("the S3_BUCKET is: ", S3_BUCKET);
    UserModel.findById(req.session.user._id, function(err, user){
        ClassModel.find({"producer" : user.username},function(err,createdClass){
            TopicModel.find({'author': user.username}, function (err, topics) {
                if(err){
                    console.log(err);
                    req.flash('error','System error');
                    return res.redirect('/profile');
                }
                
                res.render('profile',{
                    title:'Profile',
                    user: user,
                    createdClasses:createdClass,
                    topics: topics,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });   
};


