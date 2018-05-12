var moment = require('moment');
var path = require('path');

var formidable = require('formidable');
var TopicModel = require('../models/topic.model');
var ClassModel = require('../models/class.model');

exports.allTopics = function(req,res){
    ClassModel.find({}, function(err, classes){
        if(err){
            req.flash('error','Could not find classes in mongodb');
            return res.redirect('/');
        }
        res.render('all-topics',{
                title: 'All topics',
                classes:classes,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
        });
    });
};

exports.topicsUnderClass = function(req,res){

    var id = req.query.id;
    if(id){
        ClassModel.findById(id, function (err, data) {
            if(err){
                console.log(err);
                req.flash('error','topics under class showing error');
                return res.redirect('/topic/all-topics');
            }
            res.render('class-topics', {
                title: 'Topics under class',
                user: req.session.user,
                theClass: data,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    }else{
        req.flash('error','Invalid class id');
        res.redirect('back');
    };
};


exports.topic = function(req,res){
    var topicId = req.query.topicId;
    console.log("what is the id? ");
    console.log(topicId);
    if(topicId) {
        TopicModel.findById(topicId, function (err, topic) {
            if (err) {
                req.flash('error', 'Single topic showing error');
                return res.redirect('/topic/all-topics');
            }
            ClassModel.findOne({"topics._id": topicId}, function (err, theClass) {
                if(err){
                    req.flash('error','No class match this topic');
                    return res.redirect('/topic/all-topics');
                }
                res.render('topic', {
                    title: 'Single topic',
                    user: req.session.user,
                    topic: topic,
                    theClass: theClass,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    }else{
        req.flash('error','Invalid class id and topic id');
        res.redirect('/profile');
    };
};

exports.postTopic = function (req, res) {
    var id = req.query.id;

    ClassModel.findById(id,function(err,data){
        if(err){
            req.flash('error','Topic Create upload error');
            return res.redirect('back');
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
            return res.redirect('back');
        }

        var topicName = fields.topicName;
        var article = fields.article;
        var postImg = files.postImg.path.split(path.sep).pop();
        var viewer= fields.viewer;

        try {
            if (!topicName.length) {
                throw new Error('Please write the topic name');
            }
            if (!article.length) {
                throw new Error('Please write the topic content');
            }

        } catch (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        }

        var newTopic = new TopicModel({
            topicName:topicName,
            author:{
                name:req.session.user.username,
                avatar: req.session.user.avatar
            },
            article: article,
            postImg: postImg,
            postTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
            viewer: viewer
        });

        newTopic.save(function(err){
            if(err){
                console.log('Post topic error');
                req.flash('err','Post topic error');
                return res.redirect('back');
            }
            console.log('Post topic success');
            req.flash('success','Post topic success');
        });

        ClassModel.update({"_id": id},{$addToSet:{"topics":newTopic}},function (err) {
            if(err){
                console.log(err);
                return;
            }
            console.log("new topic update success");
            req.flash('success','topic update success');
            res.redirect('/topic/detail/article?id='+id+'&topicId='+newTopic._id);
        });
    });
};

exports.writeComment = function(req,res) {
    var id = req.query.id;
    var topicId = req.query.topicId;

    var newComment = {
        writer:{
            name: req.session.user.username,
            avatar: req.session.user.avatar
        },
        content: req.body.comment,
        writeTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString()
    };

    TopicModel.update({"_id": topicId},{$addToSet:{"comments":newComment}},function (err) {
        if(err){
            console.log(err);
            return;
        }
        console.log("new comment update success");
        req.flash('success','new comment update success');

        res.redirect('/topic/detail/article?id='+id+'&topicId='+topicId);
    })
};

