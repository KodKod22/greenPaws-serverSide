const { Router } = require('express');
const locationsRouter = new Router();
const { locationsController } = require('../controllers/locationsController.js');
const  middleware  = require('../middleware/checkAddbottels.js');

locationsRouter.get('/Locations',locationsController.getLocations);
locationsRouter.post('/addBottles',middleware,locationsController.addBottles)

module.exports = { locationsRouter }