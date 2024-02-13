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
var Session   =  require('../handlers/session');
var Orders    =  require('../handlers/orders');
var Products  =  require('../handlers/products');
var Drivers   =  require('../handlers/drivers');
var Etc       =  require('../handlers/etc');
var VLR       =  require('../handlers/validators');
var Checkout  =  require('../handlers/checkout');
var Counter   =  require('../handlers/counter');

router.post('/paymentfailed', [VLR.NeedsID, VLR.NeedsValue, Checkout.CanCheck], async function (req, res) 
{
    Checkout.PaymentFailed(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/paymentok', [VLR.NeedsID, VLR.NeedsValue, Checkout.CanCheck], async function (req, res) 
{
    Checkout.PaymentOK(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/deliverok', [VLR.NeedsID, Checkout.CanCheck], async function (req, res) 
{
    Checkout.DeliverOK(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/deliverpending', [VLR.NeedsID, Checkout.CanCheck], async function (req, res) 
{
    Checkout.DeliverPending(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/deliverfailed', [VLR.NeedsID, VLR.NeedsValue, Checkout.CanCheck], async function (req, res) 
{
    Checkout.DeliverFailed(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/untake', [VLR.NeedsID, Drivers.IsAvailable], async function (req, res) 
{
    Drivers.Untake(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/take', [VLR.NeedsID, Drivers.IsAvailable], async function (req, res) 
{
    Drivers.Take(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/getstatus', async function (req, res) 
{
    Drivers.GetStatus(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/getunassigned', [Etc.RangeCheck], async function (req, res) 
{
    Drivers.GetUnassigned(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/orders/stats', [Etc.RangeCheck, VLR.NeedsDate], async function (req, res) 
{
    Drivers.OrderStats(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/orders/get', [Etc.RangeCheck], async function (req, res) 
{
    Drivers.OrderGet(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/orders/search', [Etc.RangeCheck, VLR.FormatValue], async function (req, res) 
{
    Drivers.OrderSearch(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/orders/getmine', [Etc.RangeCheck], async function (req, res) 
{
    Drivers.OrderGetMine(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});



router.post('/get', [Etc.RangeCheck], async function (req, res) 
{
    Drivers.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/setstatus', [VLR.NeedsValue], async function (req, res) 
{
    Drivers.SetStatus(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/stats', [], async function (req, res) 
{
    Drivers.DriverStats(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});



module.exports = router;
