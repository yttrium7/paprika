var mongoose = require('mongoose');
var config = require('./../config/config');


mongoose.connect(config.mongodb);

var LessonSchema = mongoose.Schema({
    lessonName:String,
    description: String,
    content: String,
    file: String,
    uploadTime: String,
});

var LessonModel = mongoose.model('Lesson', LessonSchema);
module.exports = LessonModel;