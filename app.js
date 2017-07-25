'use strict';
var config = require('./config');
var logger = require('./logger')(module);
var util = require('util');
var uaParser = require('ua-parser-js');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('This is ua parser server');
});

app.get('/:ua', function (req, res) {
    logger.info('resolving : ' + req.params.ua);
    res.send(uaParser(req.params.ua));
});

app.all('/*', function (req, res) {
    res.status(404).send('Not Found');
});

app.set('port', config.express.port);

var server = app.listen(app.get('port'), function () {
    logger.info(util.format('Express server listening on port %s', server.address().port));
});
