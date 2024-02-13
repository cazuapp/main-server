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

var httpr     =   require('../run/httpr');
var express   =   require('express');
var router    =   express.Router();
var si        =   require('systeminformation');
var protocol  =   require('../run/protocol');
var Promise   =   require('promise');
var Status    =   require('../handlers/status');

router.post('/runall', async function (req, res) 
{
    Status.RunAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/countall', async function (req, res) 
{
    Status.CountAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/load', async function (req, res) 
{
    si.currentLoad().then(function (result) 
    {
        res.status(httpr.ok).send({ data: { system: result.currentLoadSystem, user: result.currentLoadUser }});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({codes: error});
    })
});


router.post('/mem', async function (req, res) 
{
    si.mem().then(function (result) 
    {
        res.status(httpr.ok).send({data: result});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({codes: error});
    })
});

router.post('/server', async function (req, res) 
{
    si.osInfo().then(function (result) 
    {
        res.status(httpr.ok).send({ data: { hostname: result }});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/time', async function (req, res) 
{
    res.status(httpr.ok).send({ data: si.time() });
});

router.post('/sql', async function (req, res) 
{
    Status.SQL().then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/reset', async function (req, res) 
{
    Status.Reset().then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
