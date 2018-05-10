var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var TopicModel = require('../models/topic.model');
var moment = require('moment');
var formidable = require('formidable');
var path = require('path');

exports.class = function (req, res) {

    var id = req.query.id;

    ClassModel.findById(id,function(err, data){
        if(err){
            console.log(err);
            //req.flash('error','Class lesson showing error');
            return res.redirect('/');
        }
        res.render('class',{
            title:'Class',
            user: req.session.user,
            //success: req.flash('success').toString(),
            //error: req.flash('error').toString(),
            theClass:data
        });
    });
};


exports.lesson = function (req, res) {
    var lessonId = req.query.lessonId;
    var classId = req.query.classId;
    var producer = req.query.producer;
    var className = req.params.className;
    //var lessonName = req.params.lessonName;

    LessonModel.findById(lessonId,function(err, data){
        if(err){
            console.log(err);
            //req.flash('error','Class lesson showing error');
            return res.redirect('/profile');
        }
        res.render('lesson',{
            title:'Lesson',
            user: req.session.user,
            producer: producer,
            //success: req.flash('success').toString(),
            //error: req.flash('error').toString(),
            lesson:data
        });
    });
};





