const { Router } = require('express');
const usersRouter = new Router();
const { usersController } = require('../controllers/usersController.js');

usersRouter.post('/user',usersController.getUser);
usersRouter.get('/userRecycleStats',usersController.getUserRecycleStats)

module.exports = { usersRouter }