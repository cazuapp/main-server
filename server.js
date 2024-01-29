#!/usr/bin/env

const { promises: Fs }   =  require('fs')
const { Table }          =  require('console-table-printer');

var http                 =  require('http');
var debug                =  require('debug')('express-sequelize');
var Caching              =  require('./run/cache');
var app                  =  require('./run/instance');
var models               =  require('./databases/sql');
var format               =  require('./handlers/format');
var si                   =  require('systeminformation');
const Path               =  require('path');
var Forgot               =  require('./timers/forgot');
var Undelivered          =  require('./timers/undelivered');
var Etc                  =  require('./handlers/etc');

async function exists(file) 
{
    path = Path.join(__dirname, file)

    try 
    {
         await Fs.access(path)
         return true
    } 
    catch 
    {
         return false
    }
}

async function initialize(check) 
{
    var server = http.createServer(app);

    await models.sequelize.sync().then(function () 
    {
                format.ok(`${'API server listening on'.padEnd(23)} ${server.address().address}:${server.address().port}`);
    });
}

initialize(true);
