var mongoose = require('mongoose');
var config = require('./../config/config');
var LessonSchema = require('../models/lesson.model').schema;
var TopicSchema = require('../models/topic.model').schema;

mongoose.connect(config.mongodb);

var ClassSchema = new mongoose.Schema({
    className:String,
    producer:String,
    description: String,
    coverImg:String,
    enrollNumber: Number,
    createTime:String,
    tag:String,
    lessons:[LessonSchema],
    topics:[TopicSchema]
});

var ClassModel = mongoose.model('Class', ClassSchema);
module.exports = ClassModel;