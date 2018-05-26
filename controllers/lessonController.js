var ClassModel = require('../models/class.model');
var LessonModel = require('../models/lesson.model');
var UserModel = require('../models/user.model');
var config = require('../config/config');

var path = require('path');
var moment = require('moment');
var formidable = require('formidable');
var marked = require('marked');
var fs = require('fs');
var aws = require('aws-sdk');

const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config.region = 'us-east-2';
aws.config.update({ accessKeyId: config.AWS_KEY_ID, secretAccessKey: config.AWS_SECRET_KEY });
var s3 = new aws.S3();

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

    form.keepExtensions = true;
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

        var key = lessonName + '-lesson-' + files.lessonFile.name;
        var data = fs.readFileSync(files.lessonFile.path);
        var type = files.lessonFile.type;

        const s3Params = {
            Bucket: S3_BUCKET,
            Key: key,
            Body: data,
            Expires: 10000,
            ContentType: type,
            ACL: 'public-read'
        };
        

        s3.putObject(s3Params,(err, data) => {
            if(err){
                console.log(err);
                req.flash('error','Uploadig lesson files failed');
                return res.redirect('/class/lesson?lessonId='+lessonId);
            }
        });
        var urlParams = {Bucket: S3_BUCKET, Key: key};
        s3.getSignedUrl('getObject', urlParams, (err, data) => {

            if(err){
              console.log(err);
              return res.redirect('/class/lesson?lessonId='+lessonId);
            }
            const returnData = {
                signedRequest: data,
                url: `https://${S3_BUCKET}.s3.${s3.config.region}.amazonaws.com/${key}`
            };

            var updateLesson = {
                lessonName:lessonName,
                description: description,
                content: marked(content),
                files:returnData.url,
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
                req.flash('success','Lesson edit success');
                res.redirect('/class/lesson?lessonId='+lessonId);
            });
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

        var key = lessonName + '-lesson-' + files.lessonFile.name;
        var data = fs.readFileSync(files.lessonFile.path);
        var type = files.lessonFile.type;

        const s3Params = {
            Bucket: S3_BUCKET,
            Key: key,
            Body: data,
            Expires: 10000,
            ContentType: type,
            ACL: 'public-read'
        };

        s3.putObject(s3Params,(err, data) => {
            if(err){
                console.log(err);
                req.flash('error','Uploadig lesson files failed');
                return res.redirect('/class/lesson?lessonId='+lessonId);
            }
        });

        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if(err){
              console.log(err);
              return res.redirect('/class/lesson?lessonId='+lessonId);
            }
            const returnData = {
                signedRequest: data,
                url: `https://${S3_BUCKET}.s3.${s3.config.region}.amazonaws.com/${key}`
            };

            var newLesson = new LessonModel({
                lessonName:lessonName,
                description: description,
                content: marked(content),
                files: returnData.url,
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
            });
        });
    });
};