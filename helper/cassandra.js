/**
 * Created by rahul on 15/8/17.
 */
'use strict';

let config = require('../config');
let logger = require('../logger')(module);
const cassandra = require('cassandra-driver');
let _ = require('lodash');
let util = require('util');
const https = require('https');
let cp = _.map(config.cassandra.hosts.split(','), function (c) {
    return c.trim();
});
logger.info('Contact Points: ' + config.cassandra.hosts);
const client = new cassandra.Client({contactPoints: cp, keyspace: config.cassandra.keyspace});

function dispQuery(query, params) {
    var paramsTemp = Array.from(params);
    return query.replace(/\?/g, function () {
        return paramsTemp.shift();
    });
}

function findUserFromCassandra(video, callback) {
    var queryParam = [video];
    var query = 'SELECT uid from vid_to_uid WHERE vid =? ';
    client.execute(query, queryParam, {prepare: true}, function (err, result) {
        if (err) {
            logger.error(util.format('Query %s failed with error', dispQuery(query, queryParam)));
            return callback(err);
        } else {
            if (!result || result.rows.length === 0) {
                logger.error(util.format('No result for Query %s', dispQuery(query, queryParam)));
                return callback('Not Found');
            }
            logger.debug(util.format('result found for query %s ', dispQuery(query, queryParam)));
            callback(null, Number(result.rows[0].uid.toString()));
        }
    });
}


function findUserFromWtstaging(video, cb) {
    let options = {
        host: 'wtstaging.wootag.com',
        port: 443,
        path: `/api/v1/getvideodetails/${video}`,
        method: 'GET',
    };

    let request = https.request(options, function (res) {
        let message = '';
        res.on('data', function (chunk) {
            message += chunk;
        });
        res.on('end', function () {
            if (res.statusCode !== 200) {
                return cb('Not Found');
            }
            message = JSON.parse(message);
            if (!message || !message.uid) {
                return cb('Authentication Failed');
            }
            cb(null, Number(message.uid));
        });
    });
    request.end();
}

function findInfoFromWingApi(video, cb) {
    let options = {
        host: 'wootag.com',
        port: 443,
        path: `/mobile.php/wings/getJsonViz/${video}`,
        method: 'GET',
    };

    let request = https.request(options, function (res) {
        let message = '';
        res.on('data', function (chunk) {
            message += chunk;
        });
        res.on('end', function () {
            if (res.statusCode !== 200) {
                return cb('Not Found');
            }
            message = JSON.parse(message);
            if (!message) {
                return cb('Not Found');
            }
            cb(null, message);
        });
    });
    request.end();
}

exports.findEngagementType = function (videoId, engagementId, cb) {

    findInfoFromWingApi(videoId, function (err, result) {
        if (err) {
            cb('NotFound');
        }
        else {
            let engagements = [];
            _.forEach(result.tags, (t) => {
                _.forEach(t.engagement, (e) => {
                    if (e.id === engagementId) {
                        return engagements.push(e);
                    }
                });
            });
            if (engagements.length === 0) {
                cb('Not Found');
            } else {
                cb(null, engagements[0].type);
            }

        }
    });
};

exports.findUser = function (video, cb) {
    findUserFromCassandra(video, function (err, result) {
        if (err) {
            findInfoFromWingApi(video, function (error, info) {
                if (error) {
                    cb('NotFound');
                }
                else {
                    cb(null, info.user_id);
                }
            });
        } else {
            cb(null, result);
        }
    });
};