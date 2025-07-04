const { Router } = require('express');
const requestRouter = new Router();
const { requestController } = require('../controllers/requestController.js');
const  { checkUser, checkLocation }  = require('../middleware/checkReg.js');

requestRouter.post('/request',checkUser, checkLocation,requestController.addRequest);
requestRouter.get('/:userId',requestController.getUserRequest)
module.exports = { requestRouter }