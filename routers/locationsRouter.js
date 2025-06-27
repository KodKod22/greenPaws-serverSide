const { Router } = require('express');
const locationsRouter = new Router();
const { locationsController } = require('../controllers/locationsController.js');
const  { checkUser, checkLocationIsActive, checkBottlesCount }  = require('../middleware/checkReg.js');

locationsRouter.get('/Locations',locationsController.getLocations);
locationsRouter.post('/addBottles',checkUser, checkLocationIsActive, checkBottlesCount,locationsController.addBottles)

module.exports = { locationsRouter }