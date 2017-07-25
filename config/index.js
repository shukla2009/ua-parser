'use strict';
var env = process.env.ENV || 'prod';
var configUrl = './' + env;
module.exports = require(configUrl);