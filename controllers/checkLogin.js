exports.checkLogin = function checkLogin(req,res,next){
    if(!req.session.user){
        req.flash('error','Please login First');
        return res.redirect('/login');
    }
    next();
};

exports.checkNoLogin = function checkNoLogin(req,res,next){
    if(req.session.user){
        req.flash('error','Already login');
        return res.redirect('/');
    }
    next();
};