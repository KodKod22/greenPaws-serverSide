const { Router } = require('express');
const locationsRouter = new Router();
const { locationsController } = require('../controllers/locationsController.js');

locationsRouter.get('/Locations',locationsController.getLocations);

module.exports = { locationsRouter }