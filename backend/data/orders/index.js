const Orders = require('./order');
const OrdersService = require('./service');

const service = OrdersService(Orders);

module.exports = service;