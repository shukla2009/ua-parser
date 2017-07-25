'use strict';
module.exports = {
    express: {
        port: process.env.PORT || 8080
    },
    log: {
        level: process.env.LOG_LEVEL || 'info'
    }
};