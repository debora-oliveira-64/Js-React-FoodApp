let AuthAPI = require('./server/auth');
let UsersAPI = require('./server/users');
let OrdersAPI = require('./server/orders');
let PlatesAPI = require('./server/plates');
let RestaurantsAPI = require('./server/restaurants');
let ImagesAPI = require('./server/images')
let EmailRouter = require('./server/email')
const express = require('express');

function init () {
    let api = express();

    api.use('/email', EmailRouter());
    api.use('/images', ImagesAPI());
    api.use('/auth', AuthAPI());
    api.use('/users', UsersAPI());
    api.use('/orders', OrdersAPI());
    api.use('/plates', PlatesAPI());
    api.use('/restaurants', RestaurantsAPI());
    return api;
}

module.exports = {
    init: init,
}