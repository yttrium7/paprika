var indexController = require('../controllers/indexController');
var userController = require('../controllers/userController');
var topicController = require('../controllers/topicController');
var profileController = require('../controllers/profileController');
var classController = require('../controllers/classController');
var checkLogin = require('../controllers/checkLogin').checkLogin;
var checkNoLogin = require('../controllers/checkLogin').checkNoLogin;


module.exports = function(app){
    app.get('/', indexController.index);
    app.get('/about-us', indexController.aboutUs);

    app.get('/sign-up', checkNoLogin, userController.signUp);
    app.post('/sign-up', userController.signUpNew);

    app.get('/login', userController.login);
    app.post('/login', checkNoLogin, userController.loginCheck);
    app.get('/logout', userController.logout);

    app.get('/user/:username', userController.userPage);

    app.get('/profile', checkLogin, profileController.profile);
    app.get('/profile/create-class', checkLogin, profileController.createClass);
    app.post('/profile/create-class', checkLogin, profileController.createNewClass);
    app.get('/profile/upload-lesson', checkLogin, profileController.uploadLesson);
    app.post('/profile/upload-lesson', checkLogin, profileController.uploadNewLesson);


    app.get('/class/detail', classController.class);
    app.post('/class/detail', checkLogin, classController.enrollClass);
    app.get('/class/detail/lesson',classController.lesson);


    app.get('/topic/all-topics', topicController.allTopics);
    app.get('/topic/detail/article', topicController.topics);
    app.post('/topic/detail/article', checkLogin, topicController.writeComment);
    app.get('/topic/create-topic', topicController.postTopic);
    app.post('/topic/create-topic', topicController.postNewTopic);

};