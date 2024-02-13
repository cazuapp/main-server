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

/*
 * Server's main instance. This file contains routes handlers 
 * for basic, unmanaged and managed calls.
 */


require('dotenv').config();

var path          =    require('path');

var express       =    require('express');
var logger        =    require('morgan');
var bodyparser    =    require('body-parser');
var useragent     =    require('express-useragent');
var timeout       =    require('connect-timeout'); 

var format        =    require('../handlers/format');
var SessionX      =    require('../handlers/session');
var Privs         =    require('../handlers/privs');
var Getters       =    require('../handlers/getters');
var Setters       =    require('../handlers/setters');
var Bans          =    require('../handlers/bans');
var Holds         =    require('../handlers/holds');
var Streams       =    require('../handlers/streams');
var Ping          =    require('../handlers/ping');

/* Core middlewares */ 

var Key	          =    [Ping.GetKey];
var Maint 	  =    [Ping.InMaintaince];
var CoreMiddle    =    [SessionX.Required, Streams.IsTokenOut, Bans.IsBanned, Getters.GetUser, Setters.IsOverride, Getters.GetUser, Setters.SetLocation, Setters.SetData];

var BaseMiddle    =    [Key, Maint, CoreMiddle, Privs.CanAssign];
var ManagedMiddle =    [CoreMiddle, Privs.CanManage];
var AssignMiddle  =    [CoreMiddle, Privs.CanAssign];
var RootMiddle    =    [CoreMiddle, Privs.CanRoot];
var DriverMiddle  =    [Maint, CoreMiddle, Getters.GetDriver, Getters.GetLocation];

var NoMiddle      =    [Key, SessionX.AuthNone];

/* Define routers and the Express app */

var user          =    express.Router();
var public        =    express.Router();
var app           =    express();
var version       =    process.env.VERSION;

/* Set timeout period for a given connection */

app.use(timeout(120000));
app.use(HaltOnTimedout);

function HaltOnTimedout(req, res, next)
{
    if (!req.timedout) 
    {
       next();
    }
}

app.set('view engine', 'ejs');

var Variants       =    require('../routes/variants');
var Products       =    require('../routes/products');
var Where          =    require('../routes/where');
var Counters       =    require('../routes/counters');
var Bans           =    require('../routes/bans');
var Driver         =    require('../routes/driver');
var Startup        =    require('../routes/startup');
var Status         =    require('../routes/status');
var Location       =    require('../routes/location');
var NoAuth         =    require('../routes/noauth');
var Address        =    require('../routes/address');
var Managed        =    require('../routes/managed');
var UnManaged      =    require('../routes/unmanaged');
var Orders         =    require('../routes/orders');
var Holds          =    require('../routes/holds');
var User           =    require('../routes/user');
var Roles          =    require('../routes/roles');
var Schedule       =    require('../routes/schedule');
var Collections    =    require('../routes/collections');
var Favorites      =    require('../routes/favorites');
var Preferences    =    require('../routes/preferences');
var Checkout       =    require('../routes/checkout');
var Home           =    require('../routes/home');

var Setup          =    require('../routes/setup');
var Payments       =    require('../routes/payments');

/* public */

var PublicUser     =    require('../www/user');

/* Helpers */ 

var helper        =     require('../handlers/init');

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(useragent.express());

app.use(helper.SetHeaders);
user.use(helper.Routes);

/* Enable logging and live debugging in development mode */

if (process.env.NODE_ENV == "development")
{
      app.use(logger('dev'));
      app.use(helper.LiveDebug);

}

app.use('/', PublicUser);

/* Routes */


app.use('/server/api/' + 'app',    user);

user.use('/startup',        NoMiddle, Startup);

user.use('/setup',          NoMiddle, Setup);
user.use('/variants',       BaseMiddle, Variants);
user.use('/checkout',       BaseMiddle, Checkout);
user.use('/favorites',      BaseMiddle, Favorites);
user.use('/products',       BaseMiddle, Products);
user.use('/noauth',         NoMiddle, NoAuth);
user.use('/driver',         DriverMiddle, Driver);
user.use('/status',         ManagedMiddle, Status);
user.use('/bans',           ManagedMiddle, Bans);
user.use('/managed',        ManagedMiddle, Managed);
user.use('/counters',       ManagedMiddle, Counters);
user.use('/where',          ManagedMiddle, Where);
user.use('/unmanaged',      BaseMiddle, UnManaged);
//user.use('/schedule',       ManagedMiddle, Schedule);
user.use('/holds',          ManagedMiddle, Holds);
user.use('/user',           BaseMiddle, User);
user.use('/home',           BaseMiddle, Home);

user.use('/location',       BaseMiddle, Location);
user.use('/orders',         BaseMiddle, Orders);
user.use('/address',        BaseMiddle, Address);
user.use('/roles',          AssignMiddle, Roles);
user.use('/collections',    BaseMiddle, Collections);
user.use('/preferences',    BaseMiddle, Preferences);

user.use('/payments',       BaseMiddle, Payments);

/* Public calls */

user.use('/www/',         public);


/* Public assets */

app.use('/server/assets', express.static(path.join(__dirname, '../assets')));

/* 
 * The following app usage is invoked as 
 * a route is not found. 
 */

app.use(function(req, res, next) 
{
      var err = new Error({codes: [protocol.invalid_endpoint]});
      res.status(404).send({codes: [protocol.invalid_endpoint]});
      next(err);
});

/* 
 * The following app usage is invoked as 
 * a route is invalid, for instance, when
 * a json is poorly formatted. 
 */

app.use(function(err, req, res, next) 
{
      return res.status(404);
});

module.exports = app;
