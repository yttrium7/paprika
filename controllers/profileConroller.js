
exports.profile = function (req, res) {
    var user = req.session.user;
    var topic =
    res.render('profile', {title: 'Profile', user: user, topic: topic});
};