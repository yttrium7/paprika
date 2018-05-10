var UserModel = require('../models/user.model');
var sha1 = require('sha1');



exports.signUp = function(req,res) {
    res.render('sign-up', {title: 'User Sign Up', user: req.session.user});
};

exports.signUpNew = function(req,res) {

    var user = new UserModel({
        username:req.body.username,
        password:req.body.password,
        email:req.body.email,
        gender:req.body.gender
    });

    if(req.body['password'] !== req.body['re-password']){
        console.log('Passwords are different');
        return res.redirect('/sign-up');
    }

    UserModel.findOne({'username':user.username},function(err,data){
        if(err){
            return res.redirect('/');
        }
        if(data != null){
            console.log('Username has been used');
            return res.redirect('/sign-up');
        }else{
            user.save(function(err){
                if(err){
                    console.log(err);
                    return res.redirect('/');
                }
                req.session.user = user;
                console.log('Sign Up Success !');
                res.redirect('/');
            })
        }
    })
};

exports.login = function(req,res) {
    res.render('login', {title: 'User Login', user: req.session.user});
};

exports.loginCheck = function(req,res) {
    var password = req.body.password;
    console.log('Password is %s', password);
    UserModel.findOne({'username':req.body.username},function(err,user){
        if(err){
            console.log('error','err');
            return res.redirect('/');
        }
        // no user exist
        if(!user){
            console.log('error','No User Exist');
            return res.redirect('/login');
        }

        if(user.password !== password){
            console.log('error','Wrong Password');
            return res.redirect('/');
        }
        req.session.user = user;
        console.log(user.username);
        res.redirect('/');
    });
};

exports.logout = function(req,res) {
    req.session.user = null;
    res.redirect('/');
};