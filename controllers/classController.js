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
        UserModel.find({}, function(err, users){
            res.render('class',{
                title:'Class',
                user: req.session.user,
                theClass: data,
                enrolled: enrolled,
                users : users,
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

    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
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
        var enrollNumber= fields.enrollNumber;
        var tag = fields.tag;

        var newClass = new ClassModel({
            className:className,
            producer:req.session.user.username,
            description: description,
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


exports.deleteClass = function(req, res){
    var id = req.query.id;

    //remove each lesson in this class in LessonModel
    ClassModel.findById(id, function(err, data){
        data.lessons.forEach(function(lesson){
            LessonModel.findByIdAndRemove(lesson._id, function(err){
                if(err){
                    req.flash("error","Delete class lessons failed");
                    return req.redirect('/class?id='+id);
                }
            })
        })
    })

    //remove each user's enrolled this class
    UserModel.updateMany({"enrolledClass._id":id}, {$pull: {enrollClass:{"_id":id}}}, function(err){
        if(err){
            req.flash("error", "Delete class in user failed");
            return req.redirect('/class?id='+id);
        }
    })
    
    //remove each class in ClassModel
    ClassModel.findByIdAndRemove(id,function(err){
        if(err){
            req.flash("error","Delete class failed");
            return req.redirect('/class?id='+id);
        }
        req.flash("success","Class Deleted");
        res.redirect('/profile');
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











