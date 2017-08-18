'use strict';
var config = require('./config');
var logger = require('./logger')(module);
var util = require('util');
var uaParser = require('ua-parser-js');
var express = require('express');
var app = express();
let db = require('./helper/cassandra');
app.get('/', function (req, res) {
    res.send('This is ua parser server');
});

app.get('/ua/:ua', function (req, res) {
    logger.info('resolving : ' + req.params.ua);
    res.send(uaParser(req.params.ua));
});

app.get('/users/:video', function (req, res) {
    logger.info('finding owner for video: ' + req.params.video);
    db.findUser(req.params.video, function (err, result) {
        if (err) {
            res.status(404).send('Not Found');
        }
        else {
            res.send(`${result}`);
        }
    });
});

app.all('/*', function (req, res) {
    res.status(404).send('Not Found');
});

app.set('port', config.port);

var server = app.listen(app.get('port'), function () {
    logger.info(util.format('Express server listening on port %s', server.address().port));
});
