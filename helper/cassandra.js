/**
 * Created by rahul on 15/8/17.
 */
'use strict';

let config = require('../config');
let logger = require('../logger')(module);
const cassandra = require('cassandra-driver');
let _ = require('lodash');
let util = require('util');
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

exports.findUser = function (video, callback) {
    var queryParam = [video];
    var query = 'SELECT uid from vid_to_uid WHERE vid =? ';
    client.execute(query, queryParam, {prepare: true}, function (err, result) {
        if (err) {
            logger.error(util.format('Query %s failed with error', dispQuery(query, queryParam)));
            return callback(err);
        } else {
            logger.debug(util.format('result found for query %s ', dispQuery(query, queryParam)));
            if (!result || result.rows.length === 0) {
                logger.error(util.format('No result for Query %s', dispQuery(query, queryParam)));
                return callback('Not Found');
            }
            callback(null, Number(result.rows[0].uid.toString()));
        }
    });
};





