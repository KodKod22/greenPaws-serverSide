const { Router } = require('express');
const usersRouter = new Router();
const { usersController } = require('../controllers/usersController.js');

usersRouter.post('/user',usersController.getUser);

module.exports = { usersRouter }