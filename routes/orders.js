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
var Address   =  require('../handlers/address');
var Orders    =  require('../handlers/orders');
var Products  =  require('../handlers/products');
var Etc       =  require('../handlers/etc');
var VLR       =  require('../handlers/validators');
var Records   =  require('../handlers/records');
var ManagerPayments   =  require('../handlers/manager_payments');
var Process           =  require('../handlers/process');
var Checkout   =  require('../handlers/checkout');

router.post('/info', [VLR.NeedsID], async function (req, res) 
{
    Orders.Info(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/historic/info', [VLR.NeedsID], async function (req, res) 
{
    Orders.HistoricInfo(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/totals', [VLR.NeedsID], async function (req, res) 
{
    Orders.Totals(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/products', [VLR.NeedsID], async function (req, res) 
{
    Orders.Products(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/get', [Etc.RangeCheck], async function (req, res) 
{
    Orders.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/items', [VLR.NeedsID, Etc.RangeCheck], async function (req, res) 
{
    Orders.Items(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/driver_info', [VLR.NeedsID], async function (req, res) 
{
    Orders.DataDriver(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/getby', [Etc.RangeCheck], async function (req, res) 
{
    Orders.GetBy(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/cancel', [VLR.NeedsID, Orders.IDAssociated, Orders.IsReady, Orders.IsCancelled, Orders.DisconnectIf(["cancelled"])], async function (req, res) 
{
    Checkout.Cancel(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/add', [Orders.ValidAdd, VLR.RequestDelete, Address.IDExists, Address.InfoMiddle, ManagerPayments.IDExists, Process.CheckItems], async function (req, res) 
{
    Process.Add(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/preorder', [Orders.ValidPreAdd, VLR.RequestDelete, Process.CheckItems], async function (req, res) 
{
    Process.PreAdd(req).then(function (result) 
    {
    
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
