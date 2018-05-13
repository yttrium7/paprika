var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var UserModel = require('../models/user.model');

var path = require('path');
var moment = require('moment');
var formidable = require('formidable');


exports.class = function (req, res) {

    var id = req.query.id;
    var enrolled = false;

    if(req.session.user){
        UserModel.findOne({'_id': req.session.user._id, "enrolledClass._id":id}, function (err, userEnrolled) {
            if(userEnrolled){enrolled = true;}
        });
    }
    ClassModel.findById(id,function(err, data){
        if(err){
            req.flash('error','Class finding error');
            return res.redirect('/');
        }
        if(!req.session.user){
            UserModel.find({}, function(err, users){
                res.render('class',{
                    title:'Class',
                    user: null,
                    theClass: data,
                    enrolled: enrolled,
                    users : users,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            })
        }else{
            UserModel.findById(req.session.user._id, function(err, user){
                UserModel.find({}, function(err, users){
                    res.render('class',{
                        title:'Class',
                        user: user,
                        theClass: data,
                        enrolled: enrolled,
                        users : users,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                });
            });   
        };
    });
};


exports.lesson = function (req, res) {

    var lessonId = req.query.lessonId;
    var id = req.query.id;
    
    ClassModel.findById(id, function(err, theClass){

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
                    classId: id,
                    lesson:lesson,
                    producer: producer,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });
};

exports.enrollClass = function (req, res) {
    var id = req.query.id;
    var user = req.session.user;

    ClassModel.findById(id, function (err, data) {
        ClassModel.update({"_id":id}, {$inc:{"enrollNumber":1}}, function(err){
            if(err){console.log("error ","enroll number inc failed")}
        });
        UserModel.update({"_id": user._id},{$addToSet:{"enrolledClass": data}}, function (err) {
            if(err){
                req.flash('error','Class Enroll error');
                return res.redirect('/profile');
            }
            res.redirect("/profile");
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
                return req.redirect('back')
            }
            req.flash("success","Lesson Deleted");
            res.redirect('/class/detail?id='+id);
        });
    });
};

exports.editLesson = function (req, res) {
    var lessonId = req.query.lessonId;

    LessonModel.findById(lessonId,function(err,data){
        if(err){
            req.flash('error','Lesson Found error');
            return res.redirect('back');
        }
        res.render('edit-lesson',{
            title:'Edit your topic',
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
    var id = req.query.id;

    form.encoding = 'utf-8';
    form.uploadDir = path.dirname(__dirname) + '/client/topicimages/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Cannot get data from topic-edit from');
            return res.redirect('back');
        }

        var lessonName = fields.lessonName;
        var description = fields.description;
        var content = files.content.path.split(path.sep).pop();

        try {
            if (!lessonName.length) {
                throw new Error('Please write the topic name');
            }
            if (!description.length) {
                throw new Error('Please write the topic content');
            }

        } catch (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        }

        var updateLesson = {
            lessonName:lessonName,
            description: description,
            content: content,
            updateTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
        };

        LessonModel.update({"_id": lessonId},{$set:{lessonName: updateLesson.lessonName, 
            description: updateLesson.description,
            content: updateLesson.content,
            uploadTime: updateLesson.updateTime}},function (err) {
            if(err){
                console.log(err);
                return;
            }
            req.flash('success','topic edit success');
            res.redirect('/class/detail/lesson?id='+id+'&lessonId='+lessonId);
        });
    });
};

exports.editLesson = function (req, res) {
    var lessonId = req.query.lessonId;

    LessonModel.findById(lessonId,function(err,data){
        if(err){
            req.flash('error','Lesson Found error');
            return res.redirect('back');
        }
        res.render('edit-lesson',{
            title:'Edit your topic',
            user: req.session.user,
            lesson:data,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });
};