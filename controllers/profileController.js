var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var UserModel = require('../models/user.model');

var moment = require('moment');
var formidable = require('formidable');
var path = require('path');


exports.profile = function(req,res) {
    var user = req.session.user;
    ClassModel.find({"producer" : user.username},function(err,data){
        if(err){
            console.log(err);
            //req.flash('error','System error');
            return res.redirect('/profile');
        }
        res.render('profile',{
            title:'Profile',
            user: user,
            //success: req.flash('success').toString(),
            //error: req.flash('error').toString(),
            createdClasses:data,
            time:moment(new Date()).format('DD-MM-YYYY HH:mm:ss'),
        });
    });
};

exports.createClass = function (req, res) {
    res.render('create-class',{
        title:'create your class',
        user: req.session.user,
        //success: req.flash('success').toString(),
        //error: req.flash('error').toString()
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
            //req.flash('error','Upload image failed');
            return;
        }
        var file = files.postImg;

        if(file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/gif' && file.type !== 'image/jpg'){
            console.log('Only png/jpeg/gif are available');
            //req.flash('error','Only png/jpeg/gif are available');
            return res.redirect('/profile/create-class');
        }

        var className = fields.className;
        var User = req.session.user;
        var description = fields.classDescription;
        var postImg = file.path.split(path.sep).pop();
        var enrollNumber= fields.enrollNumber;

        try {
            if (!className.length) {
                throw new Error('Please write the class name');
            }
            if (!description.length) {
                throw new Error('Please write the class description');
            }
        } catch (e) {
            //req.flash('error', e.message);
            return res.redirect('back');
        }

        var newClass = new ClassModel({
            className:className,
            producer:User.username,
            description: description,
            coverImg:postImg,
            enrollNumber: enrollNumber,
            createTime:moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString()
        });

        newClass.save(function(err){
            if(err){
                console.log('Create class error');
                //req.flash('err','Create topic error');
                return res.redirect('/profile/create-class');
            }
            console.log('Create class success');
            //req.flash('success','Post topic success');
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
                //req.flash('error','Class lesson upload error');
                return res.redirect('/');
            }
            res.render('create-lesson',{
                title:'Upload your lesson',
                user: req.session.user,
                //success: req.flash('success').toString(),
                //error: req.flash('error').toString(),
                createdClass:data,
                //img:path.dirname(__dirname) + '/public/images/'+data.postImg
            })
        });
    }
};

exports.uploadNewLesson = function(req,res){
    var videoPath = path.dirname(__dirname) + '/public/videos/';
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = videoPath;
    form.keepExtensions = true;
    //form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            //req.flash('error','Upload image failed');
            return;
        }
        var file = files.postVideo;
        var lessonName = fields.lessonName;
        var description = fields.lessonDescription;
        var postVideo = file.path.split(path.sep).pop();
        var id = fields.id;

        try {
            if (!lessonName.length) {
                throw new Error('Please write the class name');
            }
            if (!description.length) {
                throw new Error('Please write the class description');
            }
        } catch (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        }

        var newLesson = new LessonModel({
            lessonName:lessonName,
            description: description,
            uploadTime:moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
            classId:id
        });

        newLesson.save(function(err){
            if(err){
                console.log('Create class error');
                //req.flash('err','Create topic error');
                return res.redirect('/profile/create-class');
            }
            console.log('Create lesson success');
            //req.flash('success','Post topic success');
        });

        ClassModel.update({"_id": id},{$addToSet:{"lessons":newLesson}},function (err) {
            if(err){
                console.log(err);
                return;
            }
            console.log("new lesson update success");
            res.redirect("/profile");

        })
    });

};


