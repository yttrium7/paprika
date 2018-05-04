var userController = require('../controllers/userController');
var topicController = require('../controllers/topicController');


module.exports = function(app){
    app.get('/', userController.index);
    app.get('/home', userController.home);
    app.get('/sign-up', userController.signUp);
    app.post('/sign-up', userController.signUpNew);
    app.get('/login', userController.login);
    app.post('/login', userController.loginCheck);
    app.get('/logout', userController.logout);


    app.get('/create-topic', topicController.createTopic);
    app.get('/discussion', topicController.listTopics);
    app.get('/topic', topicController.topic);


};