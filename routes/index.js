var indexController = require('../controllers/indexController');
var userController = require('../controllers/userController');
var topicController = require('../controllers/topicController');
var profileController = require('../controllers/profileController');
var classController = require('../controllers/classController');
var checkLogin = require('../controllers/checkLogin').checkLogin;
var checkNoLogin = require('../controllers/checkLogin').checkNoLogin;


module.exports = function(app){

    app.get('/form', function(req, res){
        res.render('form',{user: req.session.user, 
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    
    // index page and about-us page
    app.get('/', indexController.index);
    app.get('/about-us', indexController.aboutUs);

    // sign up
    app.get('/sign-up', checkNoLogin, userController.signUp);
    app.post('/sign-up', userController.signUpNew);

    // login
    app.get('/login', checkNoLogin, userController.login);
    app.post('/login', checkNoLogin, userController.loginCheck);
    app.get('/logout', checkLogin, userController.logout);

    

    // other user's profile
    app.get('/user/:username', userController.userPage);

    // your profile
    app.get('/profile', checkLogin, profileController.profile);

    app.get('/profile/withdraw', checkLogin, profileController.withdrawClass);


    //app.get('/profile/editBio',checkLogin, profileController.editBio);
    // edit bio and avatar
    app.get('/profile/edit-bio', profileController.editBio);
    app.get('/profile/edit-avatar',profileController.editAvatar);
    app.post('/profile/editBio',checkLogin, profileController.editNewBio);
    app.post('/profile/editAvatar',checkLogin, profileController.editNewAvatar);

    app.get('/profile/create-class', checkLogin, profileController.createClass);
    app.post('/profile/create-class', checkLogin, profileController.createNewClass);
    app.get('/profile/upload-lesson', checkLogin, profileController.uploadLesson);
    app.post('/profile/upload-lesson', checkLogin, profileController.uploadNewLesson);

    // class related pages
    // access class and lesson
    app.get('/class/detail', classController.class);
    app.get('/class/detail/lesson',checkLogin, classController.lesson);

    //app.get('/class/edit',checkLogin, classController.editClass);
    //app.post('/class/edit',checkLogin, classController.updateEditedClass);

    //enroll class
    app.post('/class/detail', checkLogin, classController.enrollClass);
    //edit lesson
    app.get('/class/detail/edit',checkLogin, classController.editLesson);
    app.post('/class/detail/edit',checkLogin, classController.updateEditedLesson);


    app.get('/class/detail/delete',checkLogin, classController.deleteLesson);

    // topic related pages
    app.get('/topic/all-topics', topicController.allTopics);

    app.get('/topic/detail', topicController.topicsUnderClass);
    app.get('/topic/detail/edit', topicController.editTopic);
    app.post('/topic/detail/edit', topicController.updateEditedTopic);

    app.get('/topic/delete', topicController.deleteTopic);
    
    app.get('/topic/detail/article', topicController.topic);
    app.post('/topic/detail/article', checkLogin, topicController.writeComment);

    app.get('/topic/create-topic', checkLogin, topicController.postTopic);
    app.post('/topic/create-topic', checkLogin, topicController.postNewTopic);

    app.get('/topic/comment/delete', checkLogin, topicController.deleteComment);

};