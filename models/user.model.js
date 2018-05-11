var mongoose = require('mongoose');
var config = require('./../config/config');
var ClassSchema = require('../models/class.model').schema;

mongoose.connect(config.mongodb);

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    gender:String,
    avatar:String,
    bio: String,
    enrolledClass:[ClassSchema]
});

var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;