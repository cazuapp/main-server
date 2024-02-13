#!/usr/bin/env

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

var port = format.normalizePort(process.env.LISTEN_PORT || '3000');
app.set('port', port);

/* Function to check if a given file exists */

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
    
/* Basic functions */

async function load() 
{
    /* Reset Redis' cache */
    
    await Caching.flushAll();

    await si.osInfo().then(function (result) 
    {
          format.ok(`${'Hostname'.padEnd(23)} ${result.hostname}`);
    })
    .catch(function (error) 
    {
         format.error(`${ 'Hostname'.padEnd(23) } ${error}`);
    });

    /* Connect to SQL server */
    
    await connect();

    const intervalId = setInterval(async () => 
    {
       await checkDatabaseConnection();
    }, 100000);

    await models.products.count({ where: { deleted: false }}).then(result => 
    {
        format.ok(`${'Total products'.padEnd(23)} ${result}`);
    });

    await models.user_info.count({}).then(result => 
    {
        format.ok(`${ 'Total users'.padEnd(23) } ${result}`);
    });

    await models.drivers.count({}).then(result => 
    {
        format.ok(`${'Total drivers'.padEnd(23)} ${result}`);
    });
}

/* Displays settings on boot */

async function show_settings() 
{
   if (!process.env.DISPLAY_SETTINGS || Number(process.env.DISPLAY_SETTINGS) == 0) 
   {
      return 0;
   } 

   await models.settings.findAll({}).then(result => 
   {
    format.ok("Loading settings ");

    /* Setting default values in the app */

    app.set('tax', process.env.DEFAULT_TAX);
    app.set('shipping', process.env.DEFAULT_SHIPPING);
    app.set('maint', false);
    app.set('online', true);
    app.set('orders', true);

    const p = new Table({
        columns: [
            {
                name: 'Setting',
                alignment: 'left',
                color: 'black'
            }, {
                name: 'Value',
                alignment: 'left',
                color: 'black'
            }, {
                name: 'Public',
                alignment: 'left'
            },
        ],

        colorMap: {
            custom_green: '\033[1;32m',
            custom_red: '\033[1;31m'
        }
    });

    for (let i = 0; i < result.length; i++) 
    {
        var color = 'custom_red';
        var public = 'No';

        if (result[i].public == true) {
            color = 'custom_green';
            public = 'Yes';
        }

        p.addRow({
            Setting: result[i].key,
            Value: result[i].value,
            Public: public
        }, {color: color});

        app.set(result[i].key, result[i].is_bool == 1 ? Etc.as_bool(result[i].value) : result[i].value);
    }

    if (result.length > 0) 
    {
        const tableStr = p.render();
        console.log(tableStr);
    } 
    else 
    {
        format.info("No settings found.");
    }
});
}

/* Function to handle server startup errors */

function onError(error) 
{
   if (error.syscall !== 'listen') 
   {
       throw error;
   }

var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

switch (error.code) 
{
    case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;

    case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;

    default:
         
        throw error;
}}


/* Initialize function, starts everything */

async function initialize(check) 
{
     /* Checks for env file */
     
     if (check && !await exists(".env")) 
     {
           format.error('.env file not found, please refer to https://docs.cazuapp.dev/');
           process.exit(1);
     }

     var server = http.createServer(app);

    format.ok(`${'Starting CazuApp '.padEnd(23)} v${process.env.VERSION}`);
    format.ok(`${'PID'.padEnd(23)} ${process.pid}`);

    server.listen(port, process.env.NODE_ENV == 'production' ? process.env.LISTEN_HOST_PRODUCTION : process.env.LISTEN_HOST_DEVELOPMENT, async function () 
    {
        if (process.env.live_stream && Number(process.env.LOGS) == 1) 
        {
            format.ok(`${'Log stream '.padEnd(23)} ${process.env.live_stream}`);
        }

        server.on('error', onError);
        await load();
        await show_settings();

        format.ok(`${'API server listening on'.padEnd(23)} ${server.address().address}:${server.address().port}`);
    });

    Forgot.Queue();
    Undelivered.Queue();
}

/* Connect to SQL Server */

async function connect() 
{
  
  format.info('Attempting to connect to SQL server');
  
  try 
  {
     /* Close the existing connection */
    
     //await models.sequelize.close();

     /* Connect to the database */
    
     await models.sequelize.authenticate();
     await models.sequelize.sync();
    
     format.ok(`${'Connection to the SQL'.padEnd(23)} ${ process.env.DB_HOSTNAME }`)
  } 
  catch (error) 
  {
      format.error(`Error connecting to the database: ${error}`);
  }
}

async function checkDatabaseConnection() 
{
  try 
  {
    /* Test the connection by authenticating with the database */
    
    await models.sequelize.authenticate();
    //format.ok('SQL Ping OK');
  } 
  catch (error) 
  {
    format.error(`Error re-connecting to the database: ${error}`);
    
    /* Attempt to reconnect */
    
    await connect();
  } 
}

/* Starts Restful server */

initialize(true);
