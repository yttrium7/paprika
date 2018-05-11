var UserModel = require('../models/user.model');
var ClassModel = require('../models/class.model');
var sha1 = require('sha1');
var formidable = require('formidable');
var path = require('path');


exports.signUp = function(req,res) {
    res.render('sign-up',{user: req.session.user,
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

    ClassModel.find({"producer": username}, function (err, classes) {
        UserModel.findOne({'username': username}, function (err, user) {
            TopicModel.find({'author': username}, function(err, topics){
                res.render('user', {user: user,
                    createdClasses:classes,
                    topics:topics,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()});
            })
        })
    });
};

exports.signUpNew = function(req,res) {

    var avatarPath = path.dirname(__dirname) + '/public/avatars/';
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = avatarPath;
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
        var avatar = files.avatar.path.split(path.sep).pop();
        var password = fields.password;
        var repassword = fields.repassword;

        console.log('the gender is ');
        console.log(gender);

        try {
            if (!(username.length >= 1 && username.length <= 10)) {
                throw new Error('Make the username length between 1~50 characters');
            }
            if (!files.avatar.name) {
                throw new Error('Please upload your avatar');
            }
            if (password.length < 6) {
                throw new Error('Make the password length greater than 6 characters');
            }
            if (password !== repassword) {
                throw new Error('Passwords are different');
            }
        } catch (e) {
            //fs.unlink(files.avatar.path);
            req.flash('error',e.message);
            return res.redirect('back');
        }

        password = sha1(password);

        var user = new UserModel({
            username: username,
            password: password,
            gender: gender,
            avatar: avatar
        });

        UserModel.findOne({'username':user.username},function(err,data){
            if(err){
                req.flash('error','Connect to Mongodb Failed, Try Again');
                return res.redirect('/');
            }
            if(data != null){
                req.flash('error','Username has been used');
                return res.redirect('/sign-up');
            }else{
                user.save(function(err){
                    if(err){
                        req.flash('error','Connect to Mongodb Failed, Try Again');
                        return res.redirect('/');
                    }
                    delete user.password;
                    req.session.user = user;
                    req.flash('success','Sign up Success');
                    res.redirect('/');
                })
            }
        });
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

        if(user.password !== sha1(password)){

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

