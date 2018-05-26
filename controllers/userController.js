var UserModel = require('../models/user.model');
var ClassModel = require('../models/class.model');
var TopicModel = require('../models/topic.model');

var sha1 = require('sha1');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var aws = require('aws-sdk');
var config = require('../config/config');

const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config.region = 'us-east-2';
aws.config.update({ accessKeyId: config.AWS_KEY_ID, secretAccessKey: config.AWS_SECRET_KEY });
var s3 = new aws.S3();


exports.signUp = function(req,res) {
    res.render('sign-up',
        {user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
};

exports.login = function(req,res) {
    res.render('login',{user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
};

exports.userPage = function (req, res) {

    var username = req.params.username;

    ClassModel.find({"producer": username}, function (err, classes){
        UserModel.findOne({'username': username}, function (err, user){
            TopicModel.find({'author': username}, function(err, topics){
                if(!user){
                    req.flash('error','the user does not match');
                    return res.redirect('/');
                }
                res.render('user', 
                {   user: user,
                    createdClasses:classes,
                    topics:topics,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });
};

exports.signUpNew = function(req,res) {
    
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Data cannot retrieve from sign up table');
            return res.redirect('/sign-up');
        }
        var username = fields.username;
        var gender = fields.gender;
        var password = fields.password;
        var repassword = fields.repassword;

        var key = username + '-avatar-' + files.avatar.name;
        var avatarData = fs.readFileSync(files.avatar.path);

        if (password !== repassword) {
            req.flash('error','Passwords are different');
            res.redirect("/sign-up");
        }
        else {
            password = sha1(password);

            const s3Params = {
                Bucket: S3_BUCKET,
                Key: key,
                Body: avatarData,
                Expires: 10000,
                ContentType: files.avatar.type,
                ACL: 'public-read'
            };

            s3.putObject(s3Params,(err, data) => {
                if(err){
                    console.log(err);
                    req.flash('error','Uploadig avatar failed');
                    return req.redirect('/sign-up');
                }
            });

            s3.getSignedUrl('putObject', s3Params, (err, data) => {
                if(err){
                  console.log(err);
                  return res.end();
                }
                const returnData = {
                    signedRequest: data,
                    url: `https://${S3_BUCKET}.s3.${s3.config.region}.amazonaws.com/${key}`
                };

                var user = new UserModel({
                    username: username,
                    password: password,
                    gender: gender,
                    avatar: returnData.url
                });

                UserModel.findOne({'username':user.username},function(err,data){
                    if(err){
                        req.flash('error','Connect to Mongodb Failed, Try Again');
                        return res.redirect('/');
                    }
                    if(data != null){
                        req.flash('error','Username has been used');
                        return res.redirect('/login');
                    }else{
                        user.save(function(err){
                            if(err){
                                req.flash('error','Connect to Mongodb Failed, Try Again');
                                return res.redirect('/');
                            }
                            delete user.password;
                            req.session.user = user;
                            req.flash('success','Sign up Success');
                            res.redirect('/profile');
                        });
                    };
                });
            });
        };
    });
};

exports.loginCheck = function(req,res) {
    var password = req.body.password;

    UserModel.findOne({'username':req.body.username},function(err,user){
        if(err){
            req.flash('error','Connect to Mongodb Failed, Try Again');
            return res.redirect('/');
        }

        if(!user){
            req.flash('error','No User Exist');
            return res.redirect('/login');
        }

        if(sha1(password) != user.password){
            req.flash('error','Wrong Password');
            return res.redirect('/login');
        }
        delete user.password;
        req.session.user = user;
        req.flash('success','Login Success');
        res.redirect('/profile');
    });
};

exports.logout = function(req,res) {
    req.session.user = null;
    res.redirect('/');
};

