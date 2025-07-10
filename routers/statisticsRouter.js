const { Router } = require('express');
const statisticsRouter = new Router();
const { statisticsController } = require('../controllers/statisticsController');

statisticsRouter.get('/locationStats/:locationId',statisticsController.getLocationStats);
statisticsRouter.get('/locationsStats',statisticsController .getAllLocationsStats);

module.exports = { statisticsRouter }