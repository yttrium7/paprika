var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var UserModel = require('../models/user.model');
var path = require('path');

exports.class = function (req, res) {

    var id = req.query.id;
    var enrolled;
    UserModel.find({"_id": req.session.user._id, "enrolledClass._id":id}, function (err, enroll) {
        console.log("ENROLLED?", enroll);
        if(enroll && enroll!==[]){
            enrolled = true;
        }else{
            enrolled = false;
        }
        ClassModel.findById(id,function(err, data){
            if(err){
                req.flash('error','Class finding error');
                return res.redirect('/');
            }
            res.render('class',{
                title:'Class',
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                theClass:data,
                enrolled: enrolled
            });
        });

    })
};


exports.lesson = function (req, res) {

    var lessonId = req.query.lessonId;
    var id = req.query.id;
    
    ClassModel.findById(id, function(err, theClass){
        var producer = theClass.producer;
        UserModel.find({'username': producer}, function (err, ) {
            LessonModel.findById(lessonId,function(err, data){
                if(err){
                    req.flash('error','Lesson showing error');
                    return res.redirect('/profile');
                }
                res.render('lesson',{
                    title:'Lesson',
                    user: req.session.user,
                    lessonpath: path.dirname(__dirname) + '/public/videos/'+ data.content,
                    classId: id,
                    lesson:data,
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
        UserModel.update({"_id": req.session.user._id},{$addToSet:{"enrolledClass": data}}, function (err) {
            if(err){
                req.flash('error','Class Enroll error');
                return res.redirect('/profile');
            }
            res.redirect("/profile");
        })
    })
};




