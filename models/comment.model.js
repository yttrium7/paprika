var mongoose = require('mongoose');
var config = require('./../config/config');


mongoose.connect(config.mongodb);

var CommentSchema = new mongoose.Schema({
    writer:String,
    content: String,
    writeTime: String,
});

var CommentModel = mongoose.model('comment', CommentSchema);
module.exports = CommentModel;