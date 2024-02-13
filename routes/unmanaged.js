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

var microtime  =  require('microtime');
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

router.post('/pong', async function (req, res) 
{
    res.status(httpr.ok).send({ pong: microtime.now() - req.start });
});

router.post('/settings/getall', async function (req, res) 
{
    Settings.GetAll().then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
