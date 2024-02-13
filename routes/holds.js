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

var Promise   =   require('promise');
var httpr     =   require('../run/httpr');
var express   =   require('express');
var router    =   express.Router();
var si        =   require('systeminformation');
var protocol  =   require('../run/protocol');
var Holds     =   require('../handlers/holds');
var VLR       =   require('../handlers/validators');
var User      =   require('../handlers/user');

router.post('/upsert', [VLR.NeedsID], async function (req, res) 
{
    Holds.Upsert(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/del', async function (req, res) 
{
    Holds.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
