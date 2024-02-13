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

var httpr     =  require('../run/httpr');
var express   =  require('express');
var router    =  express.Router();
var Bans      =  require('../handlers/bans');
var User      =  require('../handlers/user');
var Etc       =  require('../handlers/etc');
var VLR       =  require('../handlers/validators');

router.post('/info', [VLR.NeedsID], async function (req, res) 
{
    Bans.Info(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({codes: error});
    })
});

router.post('/getwhere', [VLR.NeedsID, Etc.RangeCheck], async function (req, res) 
{
    Bans.GetWhere(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({codes: error});
    })
});

router.post('/get', [Etc.RangeCheck], async function (req, res) 
{
    Bans.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({codes: error});
    })
});

/*  Upserts a ban */

router.post('/upsert', [VLR.NeedsID], async function (req, res) 
{
    Bans.Upsert(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    });
});

router.post('/update', [VLR.NeedsID, User.IDExists], async function (req, res) 
{
    Bans.Update(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({codes: error});
    })
});

router.post('/delete', [VLR.NeedsID, User.IDExists], async function (req, res) 
{
    Bans.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
