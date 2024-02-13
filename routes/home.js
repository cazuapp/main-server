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

var Promise      =  require('promise');
var httpr        =  require('../run/httpr');
var express      =  require('express');
var router       =  express.Router();
var protocol     =  require('../run/protocol');
var Settings     =  require('../handlers/settings');
var Collections  =  require('../handlers/collections');
var Records      =  require('../handlers/records');
var Products     =  require('../handlers/products');
var Etc          =  require('../handlers/etc');
var Home         =  require('../handlers/home');
var VLR          =  require('../handlers/validators');
var Ping         =  require('../handlers/ping');
var Counter     =  require('../handlers/counter');

/* Handle POST requests to '/query' */

router.post('/search', [VLR.FormatValue, VLR.NeedsID, Etc.RangeCheck, Counter.Run("search_home")], async function (req, res) 
{
    /* Execute the search operation in the 'Home' module */

    Home.Search(req).then(function (result) 
    {
            /* Send a successful response with relevant data */

            res.status(httpr.ok).send({ counter: req.self.counter, data: result, queries: req.self.results });
    })
    .catch(function (error) 
    {
            /* Handle errors by sending a bad request response with error codes */
            
            res.status(httpr.bad_request).send({ codes: error });
    });
});

/* Handle POST requests to '/get' */

router.post('/list', [Etc.RangeCheck, VLR.NeedsID, Counter.Run("all_home")], async function (req, res) {

    /* Execute the list operation in the 'Home' module */

    Home.List(req).then(function (result) 
    {
            /* Send a successful response with relevant data, including orders from the application settings */

            res.status(httpr.ok).send({ counter: req.self.counter, data: result, orders: req.app.get('orders') });
    })
    .catch(function (error) 
    {
            /* Handle errors by sending a bad request response with error codes */

            res.status(httpr.bad_request).send({ codes: error });
    });
});

module.exports = router;
