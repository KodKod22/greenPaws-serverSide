const { Router } = require('express');
const locationsRouter = new Router();
const { locationsController } = require('../controllers/locationsController.js');
const  { checkUser, checkLocationIsActive, checkBottlesCount }  = require('../middleware/checkReg.js');

locationsRouter.get('/Locations',locationsController.getLocations);
locationsRouter.get('/Location',locationsController.getLocationByName);
locationsRouter.get('/:locationId',locationsController.getLocation);
locationsRouter.post('/addBottles',checkUser, checkLocationIsActive, checkBottlesCount,locationsController.addBottles);
locationsRouter.put('/updateLocation',locationsController.updateLocation);
locationsRouter.post('/newLocation',locationsController.addLocation);
locationsRouter.delete('/removeLocation/:location_id',locationsController.removeLocation);

module.exports = { locationsRouter }