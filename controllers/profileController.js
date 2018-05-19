var ClassModel = require('../models/class.model');
var TopicModel = require('../models/topic.model');
var UserModel = require('../models/user.model');

var formidable = require('formidable');
var path = require('path');


exports.editProfile = function(req, res){

    var form = new formidable.IncomingForm();
    form.uploadDir = path.dirname(__dirname) + '/public/avatars/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;

    var bio = req.body.editBio;

    if(bio){
        UserModel.update({"_id":req.session.user._id}, {$set:{"bio":bio}}, function(err){
            if(err){
                req.flash('error','Update bio error');
                return res.redirect('back');
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
    
            var avatar = files.avatar.path.split(path.sep).pop();
    
            UserModel.update({"_id":req.session.user._id}, {$set:{"avatar":avatar}}, function(err){
                if(err){console.log('error ','user avatar update')}
            });
            res.redirect('/profile');
    
        });
    }
};

exports.profile = function(req,res) {

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


