'use strict';
var _ = require('lodash');

var all = {
    env: process.env.NODE_ENV || 'production',
    log: {
        level: process.env.LOG_LEVEL || 'info'
    },
    port : process.env.PORT || 8080
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
    require(`./${all.env}.js`) || {});