const Restaurants = require('./restaurant');
const RestaurantService = require('./service');

const service = RestaurantService(Restaurants);

module.exports = service;