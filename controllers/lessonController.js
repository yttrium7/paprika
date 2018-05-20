var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var UserModel = require('../models/user.model');

var path = require('path');
var moment = require('moment');
var formidable = require('formidable');
var marked = require('marked');

exports.lesson = function (req, res) {

    var lessonId = req.query.lessonId;
    
    ClassModel.findOne({"lessons._id": lessonId}, function(err, theClass){
        if(err){
            req.flash('error', 'This class no longer exist');
            return res.redirect('/profile');
        }
        var producer = theClass.producer;
        UserModel.findOne({'username': producer.name}, function (err, user) {
            LessonModel.findById(lessonId,function(err, lesson){
                if(err){
                    req.flash('error','Lesson showing error');
                    return res.redirect('/profile');
                }
                res.render('lesson',{
                    title:'Lesson',
                    theClass : theClass,
                    user: req.session.user,
                    classId: theClass._id,
                    lesson:lesson,
                    producer: producer,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });
};

exports.deleteLesson = function(req, res){

    var lessonId = req.query.id;

    ClassModel.findOne({"lessons._id":lessonId}, function(err, theClass){
        var id = theClass._id;
        ClassModel.update({"_id": id}, {$pull: {lessons:{$in:{"_id":lessonId}}}}, function(err){
            if(err){console.log("error"," delete lesson from class")}
        });

        LessonModel.findByIdAndRemove(lessonId,function(err){
            if(err){
                req.flash("error","Delete lesson failed");
                return req.redirect('/class/lesson?lessonId='+lessonId);
            }
            req.flash("success","Lesson Deleted");
            res.redirect('/class?id='+id);
        });
    });
};

exports.editLesson = function (req, res) {

    var lessonId = req.query.lessonId;

    LessonModel.findById(lessonId,function(err,data){
        if(err){
            req.flash('error','Lesson Found error');
            return res.redirect('/profile');
        }
        res.render('edit-lesson',{
            title:'Edit your lesson',
            user: req.session.user,
            lesson:data,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });
};

exports.updateEditedLesson = function(req,res){

    var form = new formidable.IncomingForm();
    var lessonId = req.query.lessonId;

    form.encoding = 'utf-8';
    form.uploadDir = path.dirname(__dirname) + '/public/lessonfiles/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Cannot get data from topic-edit from');
            return res.redirect('/class/lesson?lessonId='+lessonId);
        }

        var lessonName = fields.lessonName;
        var description = fields.description;
        var content = fields.content;
        var files = files.lessonFile.path.split(path.sep).pop();

        var updateLesson = {
            lessonName:lessonName,
            description: description,
            content: marked(content),
            files:files,
            updateTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
        };

        LessonModel.update({"_id": lessonId},{$set:{lessonName: updateLesson.lessonName, 
            description: updateLesson.description,
            content: updateLesson.content,
            files:updateLesson.files,
            uploadTime: updateLesson.updateTime}},function (err) {
            if(err){
                console.log(err);
                return;
            }
            req.flash('success','topic edit success');
            res.redirect('/class/lesson?lessonId='+lessonId);
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
                return res.redirect('/profile');
            }
            res.render('create-lesson',{
                title:'Upload your lesson',
                user: req.session.user,
                createdClass:data,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
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
            return res.redirect('/profile');
        }

        var lessonName = fields.lessonName;
        var description = fields.lessonDescription;
        var content = fields.content;
        var files = files.lessonFile.path.split(path.sep).pop();

        var newLesson = new LessonModel({
            lessonName:lessonName,
            description: description,
            content: marked(content),
            files: files,
            uploadTime:moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
        });

        newLesson.save(function(err){
            if(err){
                req.flash('error','Upload Lesson error');
                return res.redirect('/profile');
            }
            req.flash('success','Upload Lesson success');
        });

        ClassModel.update({"_id": id},{$addToSet:{"lessons":newLesson}},function (err) {
            if(err){
                req.flash('error','Upload Lesson to Class error');
                return res.redirect('/profile');
            }
            res.redirect("/profile");
        })
    });
};