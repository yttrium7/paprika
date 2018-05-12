var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var UserModel = require('../models/user.model');
var path = require('path');

exports.class = function (req, res) {

    var id = req.query.id;
    var enrolled = false;

    if(req.session.user){
        UserModel.findOne({'_id': req.session.user._id, "enrolledClass._id":id}, function (err, userEnrolled) {
            if(userEnrolled){enrolled = true;}
        });
    };
    ClassModel.findById(id,function(err, data){
        if(err){
            req.flash('error','Class finding error');
            return res.redirect('/');
        }
        res.render('class',{
            title:'Class',
            user: req.session.user,
            theClass:data,
            enrolled: enrolled,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
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
                    user: req.session.user,
                    classId: id,
                    lesson:lesson,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });
};

exports.enrollClass = function (req, res) {
    var id = req.query.id;
    ClassModel.findById(id, function (err, data) {

        if(data.producer.name == req.session.user.username){
            req.flash('error', 'You are the producer !');
            return res.redirect('back');
        };

        UserModel.update({"username": req.session.user.username},{$addToSet:{"enrolledClass": data}}, function (err) {
            if(err){
                req.flash('error','Class Enroll error');
                return res.redirect('/profile');
            }
            res.redirect("/profile");
        });
    });
};