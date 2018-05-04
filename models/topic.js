var mongoose = require('mongoose');
var config = require('./../config/config');

mongoose.connect(config.mongodb);

var TopicSchema = new mongoose.Schema({
    title:String,
    author:String,
    content:String,
    publishTime:String,
    postImg:String,
    comments:[{
        name:String,
        time:String,
        content:String
    }],
    viewer:Number
});

var Topic = mongoose.model('Topic', TopicSchema);
module.exports = Topic;