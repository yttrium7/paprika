var moment = require('moment');
var path = require('path');
var formidable = require('formidable');
var marked = require('marked');

var TopicModel = require('../models/topic.model');
var ClassModel = require('../models/class.model');
var UserModel = require('../models/user.model');

exports.topic = function(req,res){

    var topicId = req.query.topicId;
    var user = req.session.user;

    if(topicId) {
        TopicModel.findById(topicId, function (err, topic) {
            if (err) {
                req.flash('error', 'Single topic showing error');
                return res.redirect('/topic/all-topics');
            };
            
            if(!user || topic.author != user.username){
                TopicModel.update({"_id":topicId}, {$inc:{"viewer":1}}, function(err){
                    if(err){console.log("error ","topic viewer number inc failed")}
                });
            }
            
            ClassModel.findOne({"topics._id": topicId}, function (err, theClass) {
                if(err){
                    req.flash('error','No class match this topic');
                    return res.redirect('/topic/all-topics');
                }
                UserModel.findOne({"username": topic.author}, function(err, author){
                    if(err){
                        req.flash('error', 'No author match this topic');
                        return res.redirect('/topic/all-topics');
                    }
                    UserModel.find({}, function(err, users){
                        res.render('topic', {
                            title: 'Single topic',
                            user: user,
                            topic: topic,
                            theClass: theClass,
                            author: author,
                            users: users,
                            success: req.flash('success').toString(),
                            error: req.flash('error').toString()
                        });
                    });
                });               
            });
        });
    }else{
        req.flash('error','Invalid class id and topic id');
        res.redirect('/profile');
    };
};

exports.deleteTopic = function(req, res){
    var topicId = req.query.id;

    ClassModel.findOne({"topics._id":topicId}, function(err, theClass){
        if(theClass){
            var id = theClass._id;
            ClassModel.update({"_id": id}, {$pull: {topics:{"_id":topicId}}}, function(err){
                if(err){console.log("error"," delete topic from class")}
            });
        };

        TopicModel.findByIdAndRemove(topicId,function(err){
            if(err){
                req.flash("error","Delete topic failed");
                return req.redirect('back')
            }
            req.flash("success","Topic Deleted");
            res.redirect('/topic/detail?id='+id);
        });
    });
};

exports.allTopics = function(req,res){
    ClassModel.find({}, function(err, classes){
        if(err){
            req.flash('error','Could not find classes in mongodb');
            return res.redirect('/');
        }
        UserModel.find({}, function(err, users){
            TopicModel.find({}, function(err, topics){
                res.render('all-topics',{
                    title: 'All topics',
                    classes:classes,
                    user: req.session.user,
                    users: users,
                    topics: topics,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            })
        })
    });
};

exports.topicsUnderClass = function(req,res){

    var id = req.query.id;
    var user = req.session.user;
    
    if(id){
        ClassModel.findById(id, function (err, data) {
            if(err){
                console.log(err);
                req.flash('error','topics under class showing error');
                return res.redirect('/topic/all-topics');
            }
            UserModel.find({}, function(err, users){
                TopicModel.find({}, function(err, topics){
                    res.render('class-topics', {
                        title: 'Topics under class',
                        user: req.session.user,
                        theClass: data,
                        users: users,
                        topics: topics,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                });
            }); 
        });
    }else{
        req.flash('error','Invalid class id');
        res.redirect('back');
    };
};

exports.postTopic = function (req, res) {
    var id = req.query.id;

    ClassModel.findById(id,function(err,data){
        if(err){
            req.flash('error','Topic Create upload error');
            return res.redirect('/topic/detail?id='+id);
        }
        res.render('create-topic',{
            title:'Post your topic',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            theClass:data
        })
    });
};

exports.postNewTopic = function(req,res){

    var form = new formidable.IncomingForm();
    var id = req.query.id;

    form.encoding = 'utf-8';
    form.uploadDir = path.dirname(__dirname) + '/public/topicimages/';;
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Cannot get data from topic-ctreate from');
            return res.redirect('/topic/detail?id='+id);
        }

        var topicName = fields.topicName;
        var article = fields.article;
        var postImg = files.postImg.path.split(path.sep).pop();
        var viewer= fields.viewer;

        UserModel.findById(req.session.user._id, function(err, user){
            
            var newTopic = new TopicModel({
                topicName:topicName,
                author:req.session.user.username,
                article: marked(article),
                postImg: postImg,
                postTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
                viewer: viewer
            });

            newTopic.save(function(err){
                if(err){
                    req.flash('err','Post topic error');
                    return res.redirect('/topic/detail?id='+id);
                }
                req.flash('success','Post topic success');
            });
    
            ClassModel.update({"_id": id},{$addToSet:{"topics":newTopic}},function (err) {
                if(err){
                    return res.redirect('/topic/all-topics');
                }
                req.flash('success','topic update success');
                res.redirect('/topic/detail/article?id='+id+'&topicId='+newTopic._id);
            });
        });   
    });
};

exports.editTopic = function (req, res) {
    var topicId = req.query.topicId;

    TopicModel.findById(topicId,function(err,data){
        if(err){
            req.flash('error','Topic Found error');
            return res.redirect('/profile');
        }
        res.render('edit-topic',{
            title:'Edit your topic',
            user: req.session.user,
            topic:data,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });
};

exports.updateEditedTopic = function(req,res){

    var form = new formidable.IncomingForm();
    var topicId = req.query.topicId;

    form.encoding = 'utf-8';
    form.uploadDir = path.dirname(__dirname) + '/public/topicimages/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            req.flash('error','Cannot get data from topic-edit from');
            return res.redirect('/topic/edit?topicId='+topicId);
        }

        var topicName = fields.topicName;
        var article = fields.article;
        var postImg = files.postImg.path.split(path.sep).pop();
        var viewer= fields.viewer;

        var updateTopic = {
            topicName:topicName,
            article: marked(article),
            postImg: postImg,
            postTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
            viewer: viewer
        };

        TopicModel.update({"_id": topicId},{$set:
            {topicName: updateTopic.topicName, 
            article: updateTopic.article,
            postImg: updateTopic.postImg,
            postTime: updateTopic.postTime}},function (err) {
            if(err){
                console.log(err);
                return res.redirect('/topic/edit?topicId='+topicId);
            }
            req.flash('success','topic edit success');
            res.redirect('/topic/detail/article?topicId='+topicId);
        });
    });
};

exports.writeComment = function(req,res) {
    var id = req.query.id;
    var topicId = req.query.topicId;

    UserModel.findById(req.session.user._id, function(err, user){

        var newComment = {
            writer: user.username,
            content: req.body.comment,
            writeTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString()
        };
        TopicModel.update({"_id": topicId},{$addToSet:{"comments":newComment},},function (err) {
            if(err){
                console.log(err);
                return;
            }
            console.log("new comment update success");
            req.flash('success','new comment update success');
    
            res.redirect('/topic/detail/article?id='+id+'&topicId='+topicId);
        });
    });
};

exports.deleteComment = function(req, res){
    var commentId = req.query.id;

    TopicModel.update({"comments._id":commentId}, {$pull: {comments:{"_id":commentId}}},function(err){
        if(err){
            req.flash("error","Delete comment failed");
            return req.redirect('back')
        }
        req.flash("success","Comment Deleted");
        res.redirect('back');
    });
};