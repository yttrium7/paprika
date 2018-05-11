var mongoose = require('mongoose');
var config = require('./../config/config');
var CommentSchema = require('../models/comment.model');


mongoose.connect(config.mongodb);

var TopicSchema = new mongoose.Schema({
    topicName:String,
    author:{
        name: String,
        avatar: String
    },
    article: String,
    postImg: String,
    postTime: String,
    viewer: Number,
    comments:[CommentSchema]
});

var TopicModel = mongoose.model('Topic', TopicSchema);
module.exports = TopicModel;