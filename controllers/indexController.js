var ClassModel = require('../models/class.model');

exports.index = function(req,res) {

    ClassModel.find({"tag": "Life Skill"}, function(err, life){
        ClassModel.find({"tag": "Arts and Music"}, function(err, arts){
            ClassModel.find({"tag": "Academic"}, function(err, aca){
                ClassModel.find({"tag": "HandCraft"}, function(err, hand){
                    var indexClass = {
                        lifeSkill:life,
                        artsMusic:arts,
                        academic:aca,
                        handcraft:hand
                    };
                    console.log(indexClass);
                    res.render('index', {classes: indexClass,
                        user:req.session.user,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()});
                });
            });
        });
    });
};

exports.aboutUs = function(req,res) {
    res.render('about-us',{user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
};