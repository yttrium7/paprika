var indexController = require('../controllers/indexController');
var userController = require('../controllers/userController');
var topicController = require('../controllers/topicController');
var profileController = require('../controllers/profileController');
var classController = require('../controllers/classController');
var lessonController = require('../controllers/lessonController');

var checkLogin = require('../controllers/checkLogin').checkLogin;
var checkNoLogin = require('../controllers/checkLogin').checkNoLogin;


module.exports = function(app){

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
    app.get('/user/:username/profile', userController.userPage);


    //profile
    app.get('/profile', checkLogin, profileController.profile);
    app.post('/profile',checkLogin, profileController.editProfile);


    //classes
    app.get('/class', classController.class);
    app.get('/class/create-class', checkLogin, classController.createClass);
    app.post('/class/create-class', checkLogin, classController.createNewClass);
    app.post('/class', checkLogin, classController.enrollClass);
    app.get('/class/delete',checkLogin, classController.deleteClass);
    app.get('/class/withdraw', checkLogin, classController.withdrawClass);
    
    
    //lessons
    app.get('/class/lesson',checkLogin, lessonController.lesson);
    app.get('/class/lesson/edit',checkLogin, lessonController.editLesson);
    app.post('/class/lesson/edit',checkLogin, lessonController.updateEditedLesson);
    app.get('/class/lesson/delete',checkLogin, lessonController.deleteLesson);
    app.get('/class/upload-lesson', checkLogin, lessonController.uploadLesson);
    app.post('/class/upload-lesson', checkLogin, lessonController.uploadNewLesson);


    // topics
    app.get('/topic/all-topics', topicController.allTopics);
    app.get('/topic/detail', topicController.topicsUnderClass);
    app.get('/topic/detail/edit', checkLogin, topicController.editTopic);
    app.post('/topic/detail/edit', checkLogin, topicController.updateEditedTopic);
    app.get('/topic/delete', checkLogin, topicController.deleteTopic);    
    app.get('/topic/detail/article', topicController.topic);
    app.post('/topic/detail/article', checkLogin, topicController.writeComment);
    app.get('/topic/create-topic', checkLogin, topicController.postTopic);
    app.post('/topic/create-topic', checkLogin, topicController.postNewTopic);
    app.get('/topic/comment/delete', checkLogin, topicController.deleteComment);

};