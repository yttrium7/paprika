var ClassModel = require('../models/class.model');

exports.index = function(req,res) {
    var lifeSkill;
    var artsMusic;
    var academic;
    var handCraft;

    ClassModel.find({"tag": "Life Skill"}, function(err, life){
        lifeSkill = life;
        ClassModel.find({"tag": "Life Arts and Music"}, function(err, arts){
            artsMusic = arts;
            ClassModel.find({"tag": "Life Arts and Academic"}, function(err, aca){
                academic = aca;
                ClassModel.find({"tag": "Life Arts and HandCraft"}, function(err, hand){
                    handCraft = hand;
                    var indexClass = {
                        lifeSkill:lifeSkill,
                        artsMusic:artsMusic,
                        academic:academic,
                        handcraft:handCraft
                    };
                    console.log(indexClass);
                    res.render('index', {title: 'index', user: req.session.user, classes: indexClass});
                });
            });
        });
    });
};

exports.aboutUs = function(req,res) {
    res.render('about-us', {title: 'About Us', user: req.session.user});
};