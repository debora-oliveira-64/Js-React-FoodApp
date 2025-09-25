const Plates = require('./plate');
const PlateService = require('./service');

const service = PlateService(Plates);

module.exports = service;