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

var express    =  require('express');
var router     =  express.Router();
var Ping       =  require('../handlers/ping');
var Session    =  require('../handlers/session');

var PingMiddle = [Session.AuthNone, Ping.Lookup];

router.get('/ping', [PingMiddle], async function (req, res) 
{
    res.status(httpr.ok).send({ data: req.meta });
});


module.exports = router;
