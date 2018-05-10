var moment = require('moment');
var path = require('path');

var formidable = require('formidable');
var TopicModel = require('../models/topic.model');
var ClassModel = require('../models/class.model');
var CommentModel = require('../models/comment.model');

exports.allTopics = function(req,res){

    TopicModel.find({}, function (err, data) {
        res.render('topics', {
            title: 'All topics',
            user: req.session.user,
            topics: data
        });
    })
};

exports.topics = function(req,res){
    var id = req.query.id;

    //var className = req.params.className;

    ClassModel.findById(id, function (err, data) {
        if(err){
            console.log(err);
            //req.flash('error','Class discussion showing error');
            return res.redirect('/');
        }
        if(req.query.topicId){
            var topicId = req.query.topicId;
            TopicModel.findById(topicId, function (err, topic) {
                if(err){
                    console.log(err);
                    //req.flash('error','Class discussion showing error');
                    return res.redirect('/');
                }
                res.render('topic',{
                    title: 'Single topic',
                    user: req.session.user,
                    topic: topic,
                    theClass: data
                })
            })
        }
        res.render('discussion', {
            title: 'Discussion',
            user: req.session.user,
            theClass: data
        });
    });
};

exports.postTopic = function (req, res) {
    var id = req.query.id;

    ClassModel.findById(id,function(err,data){
        if(err){
            console.log('err','postTopic wrong');
            //req.flash('error','Class lesson upload error');
            return res.redirect('/');
        }
        res.render('create-topic',{
            title:'Post your topic',
            user: req.session.user,
            //success: req.flash('success').toString(),
            //error: req.flash('error').toString(),
            theClass:data,
            //img:path.dirname(__dirname) + '/public/images/'+data.postImg
        })
    });
};

exports.postNewTopic = function(req,res){
    var imgPath = path.dirname(__dirname) + '/public/images/';
    var form = new formidable.IncomingForm();
    var id = req.query.id;

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
            return res.redirect('/profile/create-topic');
        }

        var topicName = fields.topicName;
        var article = fields.article;
        var postImg = file.path.split(path.sep).pop();
        var viewer= fields.viewer;

        try {
            if (!topicName.length) {
                throw new Error('Please write the topic name');
            }
            if (!article.length) {
                throw new Error('Please write the topic content');
            }
        } catch (e) {
            //req.flash('error', e.message);
            return res.redirect('back');
        }

        var newTopic = new TopicModel({
            topicName:topicName,
            author:req.session.user.username,
            article: article,
            postImg: postImg,
            postTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
            viewer: viewer
        });

        newTopic.save(function(err){
            if(err){
                console.log('Create topic error');
                //req.flash('err','Create topic error');
                return res.redirect('/discussion/:className');
            }
            console.log('Create topic success');
            //req.flash('success','Post topic success');
        });

        ClassModel.update({"_id": id},{$addToSet:{"topics":newTopic}},function (err) {
            if(err){
                console.log(err);
                return;
            }
            console.log("new topic update success");

            res.redirect('/topics?id='+id);
        })
    });
};

exports.writeComment = function(req,res) {
    var topicId = req.query.topicId;

    var newComment = new CommentModel({
        writer:req.session.user,
        content: req.body.comment,
        writeTime: moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString()
    });

    newComment.save(function(err){
        if(err){
            console.log('Create comment error');
            //req.flash('err','Create topic error');
            return res.redirect('back');
        }
        console.log('save comment success');
        //req.flash('success','Post topic success');
    });

    TopicModel.update({"_id": topicId},{$addToSet:{"comments":newComment}},function (err) {
        if(err){
            console.log(err);
            return;
        }
        console.log("new comment update success");

        res.redirect('/topics?id='+id+'&topicId='+topicId);
    })
};

