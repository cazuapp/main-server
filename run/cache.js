/*
 * CazuApp - Delivery at convenience.  
 * 
 * Copyright 2023 - Carlos Ferry <cferry@cazuapp.dev>
 *
 * This file is part of CazuApp. CazuApp is licensed under the New BSD License: you can
 * redistribute it and/or modify it under the terms of the BSD License, version 3.
 * This program is distributed in the hope that it will be useful, but without
 * any warranty.
 *
 * You should have received a copy of the New BSD License
 * along with this program. <https://opensource.org/licenses/BSD-3-Clause>
 */

/* Cache connection to the redis server.
 * We establish a redis server connection using promises
 * and the redis client. The cache system is used to keep track
 * of data that is not meant to stay permanently.
 */

var redis    =  require('redis')
var format   =  require('../handlers/format');

var socket = 
{
     host: process.env.CACHE_HOST,
     port: process.env.CACHE_PORT
};

if (process.env.CACHE_AUTHPASS) 
{
     socket['password'] = process.env.CACHE_AUTHPASS;
}

var cache = redis.createClient(socket);
cache.connect();

cache.on('error', (err) => 
{
     format.error(`Error while connecting to cache server ${err}`);
});

cache.on('connect', function () 
{
     format.ok(`${'Cache connection ok'.padEnd(23)} ${ process.env.CACHE_HOST }:${ process.env.CACHE_PORT}`);
});

module.exports = cache;
