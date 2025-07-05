const { Router } = require('express');
const requestRouter = new Router();
const { requestController } = require('../controllers/requestController.js');
const  { checkUser, checkLocation }  = require('../middleware/checkReg.js');

requestRouter.get('/requests',requestController.getRequests);
requestRouter.post('/addRequest',checkUser, checkLocation,requestController.addRequest);
requestRouter.get('/:userId',requestController.getUserRequest);
requestRouter.put('/updateRequest',requestController.updateRequest);
requestRouter.delete('/deleteRequest',requestController.deleteRequest);

module.exports = { requestRouter }