var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var TopicModel = require('../models/topic.model');
var UserModel = require('../models/user.model');
var CommentModel = require('../models/comment.model');

var moment = require('moment');
var formidable = require('formidable');
var path = require('path');

exports.editBio = function(req,res){
    var editBio = {
        data : '<form action="/profile/editBio" method="post"><textarea name="bio" class="2 rows"></textarea><input type="submit" value="submit"/></form>'
    };
    res.send(editBio);
};

exports.editAvatar = function(req,res){
    var editAvatar = {
        data : '<form action="/profile/editAvatar" method="post" enctype="multipart/form-data"><input name="avatar" type="file" value="choose your avatar"><input type="submit" value="submit"></form>'
    };
    res.send(editAvatar);
};

exports.editNewBio = function(req, res){
    var bio = req.body.bio;
    UserModel.update({"_id":req.session.user._id}, {$set:{"bio":bio}}, function(err){
        if(err){
            req.flash('error','Update bio error');
            return res.redirect('back');
        }
        res.redirect("/profile");
    });
};

exports.editNewAvatar = function(req, res){

    var form = new formidable.IncomingForm();
    form.uploadDir = path.dirname(__dirname) + '/public/avatars/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Uplaod new avatar error');
            return res.redirect('/profile');
        }

        var avatar = files.avatar.path.split(path.sep).pop();
        var username = req.session.user.username;
        console.log("new avatar is : ", avatar);

        UserModel.update({"username":username}, {$set:{"avatar":avatar}}, function(err){
            if(err){console.log('error ','user avatar update')}
        });

        console.log('successs', 'avatar update');
        res.redirect('/profile');

    });
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
                    time:moment(new Date()).format('DD-MM-YYYY HH:mm:ss'),
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });   
};

exports.withdrawClass = function(req, res){
    var id = req.query.id;
    ClassModel.update({"_id":id}, {$inc:{"enrollNumber":-1}}, function(err){
        if(err){console.log("error ","enroll number dec failed")}
    });
    UserModel.update({"enrolledClass._id":id}, {$pull: {enrolledClass:{"_id":id}}}, function(err){
        if(err){
            req.flash("error", "Could not find the class you want to withdraw");
            res.redirect('/profile');
        }
        req.flash("success", "Class withdrawed success");
        res.redirect('/profile');
    });
}

exports.createClass = function (req, res) {
    res.render('create-class',{
        title:'create your class',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    })
};

exports.createNewClass = function(req,res){

    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.dirname(__dirname) + '/public/classcovers/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Create Class Failed, Try Again');
            return res.redirect('/profile/create-class');
        }

        var className = fields.className;
        var description = fields.classDescription;
        var coverImg = files.coverImg.path.split(path.sep).pop();
        var enrollNumber= fields.enrollNumber;
        var tag = fields.tag;


        try {
            if (!className.length) {
                throw new Error('Please write the class name');
            }
            if (!description.length) {
                throw new Error('Please write the class description');
            }
            if (!files.coverImg.name) {
                throw new Error('Please upload your class cover image');
            }
        } catch (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        }

        var newClass = new ClassModel({
            className:className,
            producer:req.session.user.username,
            description: description,
            coverImg:coverImg,
            enrollNumber: enrollNumber,
            tag: tag,
            createTime:moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString()
        });

        newClass.save(function(err){
            if(err){
                req.flash('error','Create class error');
                return res.redirect('back');
            }
            req.flash('success','Create class success');
            res.redirect('/profile');
        });
    });
};

exports.uploadLesson = function (req, res) {
    var id = req.query.id;

    if(id && id!==''){
        ClassModel.findById(id,function(err,data){
            if(err){
                console.log(err);
                req.flash('error','Lesson upload error');
                return res.redirect('/back');
            }
            res.render('create-lesson',{
                title:'Upload your lesson',
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                createdClass:data,
            })
        });
    }
};

exports.uploadNewLesson = function(req,res){

    var id = req.query.id;
    var form = new formidable.IncomingForm();
    
    form.encoding = 'utf-8';
    form.uploadDir = path.dirname(__dirname) + '/public/lessonfiles/';
    form.keepExtensions = true;
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Upload Lesson Failed, Try Again');
            return res.redirect('/back');
        }

        var lessonName = fields.lessonName;
        var description = fields.lessonDescription;
        var content = files.lessonFile.path.split(path.sep).pop();

        try {
            if (!lessonName.length) {
                throw new Error('Please write the lesson name');
            }
            if (!description.length) {
                throw new Error('Please write the lesson description');
            }
            if (!files.lessonFile.name) {
                throw new Error('Please upload your lesson content');
            }

        } catch (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        }

        var newLesson = new LessonModel({
            lessonName:lessonName,
            description: description,
            content: content,
            uploadTime:moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
        });

        newLesson.save(function(err){
            if(err){
                req.flash('error','Upload Lesson error');
                return res.redirect('back');
            }
            req.flash('success','Upload Lesson success');
        });

        ClassModel.update({"_id": id},{$addToSet:{"lessons":newLesson}},function (err) {
            if(err){
                req.flash('error','Upload Lesson to Class error');
                return res.redirect('back');
            }
            res.redirect("/profile");
        })
    });
};


