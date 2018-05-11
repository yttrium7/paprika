var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var TopicModel = require('../models/topic.model');

var moment = require('moment');
var formidable = require('formidable');
var path = require('path');


exports.profile = function(req,res) {

    var user = req.session.user;
    ClassModel.find({"producer.name" : user.username},function(err,createdClass){
        TopicModel.find({'author.name': user.username}, function (err, topics) {
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
};


exports.createClass = function (req, res) {
    res.render('create-class',{
        title:'create your class',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    })
};

exports.createNewClass = function(req,res){

    var imgPath = path.dirname(__dirname) + '/public/images/';
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = imgPath;
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
            producer:{
                name:req.session.user.username,
                avatar:req.session.user.avatar
            },
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

    var videoPath = path.dirname(__dirname) + '/public/videos/';
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = videoPath;
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


