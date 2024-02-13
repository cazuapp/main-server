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

var express     =  require('express');
var router      =  express.Router();
var app         =  express();

var Session     =  require('../handlers/session');
var Etc         =  require('../handlers/etc');
var VLR         =  require('../handlers/validators');
var User        =  require('../handlers/user');
var Roles       =  require('../handlers/roles');

router.post('/upsert', [VLR.NeedsID, Roles.CheckIfRoot, User.IDExists], async function (req, res) 
{
    Roles.Upsert(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/delete', [VLR.NeedsID, User.IDExists, Roles.CheckIfRoot], async function (req, res) 
{
    Roles.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/get', [VLR.NeedsID, User.IDExists], async function (req, res) 
{
    Roles.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
