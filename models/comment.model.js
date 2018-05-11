var mongoose = require('mongoose');
var config = require('./../config/config');


mongoose.connect(config.mongodb);

var CommentSchema = mongoose.Schema({
    writer:{
        name: String,
        avatar: String
    },
    content: String,
    writeTime: String,
});

//var CommentModel = mongoose.model('comment', CommentSchema);
module.exports = CommentSchema;