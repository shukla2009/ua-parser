'use strict';
const config = require('./config');
const logger = require('./logger')(module);
const uaParser = require('ua-parser-js');
const express = require('express');
const app = express();
app.get('/', function (req, res) {
    res.send('This is ua parser server');
});

app.get('/ua/:ua', function (req, res) {
    logger.info('resolving : ' + req.params.ua);
    res.send(uaParser(req.params.ua));
});

app.all('/*', function (req, res) {
    res.status(404).send('Not Found');
});

app.set('port', config.port);

let server = app.listen(app.get('port'), function () {
    logger.info(`Express server listening on port ${server.address().port}`);
});
