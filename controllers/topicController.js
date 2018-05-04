var moment = require('moment');
var formidable = require('formidable');
var Topic = require('./../models/topic');
var User = require('./../models/user');

exports.topic = function (req, res) {
    res.render('topic',{
        title:'Your topic',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    })
};

exports.createTopic = function(req,res){
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
            req.flash('error','Upload image failed');
            return;
        }
        var file = files.postImg;

        if(file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif' && file.type != 'image/jpg'){
            console.log('Only png/jpeg/gif are available');
            req.flash('error','Only png/jpeg/gif are available');
            return res.redirect('/upload');
        }
        var title = fields.title;
        var author = req.session.user.username;
        var content = fields.content;
        var postImg = file.path.split(path.sep).pop();
        var viewer= fields.viewer;

        try {
            if (!title.length) {
                throw new Error('Please write the title');
            }
            if (!content.length) {
                throw new Error('Please write the content');
            }
        } catch (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        }

        var topic = new Topic({
            title:title,
            author:author,
            content:content,
            postImg:postImg,
            publishTime:moment(new Date()).format('DD-MM-YYYY HH:mm:ss').toString(),
            viewer:viewer
        });
        topic.save(function(err){
            if(err){
                console.log('Post topic error');
                req.flash('err','Post topic error');
                return res.redirect('/post');
            }
            console.log('Post topic success');
            req.flash('success','Post topic success');
            res.redirect('/');
        });
    });
};

exports.listTopics = function(req,res){
    Topic.find({},function(err,topics){
        User.find({},function(err,users){

        })
        if(err){
            console.log(err,'Error Found');
            //req.flash('error','Error Found');
            return res.redirect('/');
        }
        res.render('discussion',{
            title:'Discussion',
            //success: req.flash('success').toString(),
            //error: req.flash('error').toString(),
            topics:data,
            time:moment(new Date()).format('DD-MM-YYYY HH:mm:ss'),
        });
    })
};
