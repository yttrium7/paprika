var mongoose = require('mongoose');
var config = require('./../config/config');

mongoose.connect(config.mongodb);

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    gender:String,
    photo: String
});

var User = mongoose.model('User', UserSchema);
module.exports = User;