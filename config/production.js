'use strict';
module.exports = {
    cassandra: {
        keyspace: process.env.CASSANDRA_KEYSPACE,
        hosts: process.env.CASSANDRA_HOSTS
    }
};