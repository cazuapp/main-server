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

var httpr      =  require('../run/httpr');
var express    =  require('express');
var router     =  express.Router();
var Session    =  require('../handlers/session');
var Address    =  require('../handlers/address');
var Etc        =  require('../handlers/etc');
var VLR        =  require('../handlers/validators');
var Records    =  require('../handlers/records');

router.post('/setdefault', [VLR.NeedsID, VLR.IDToAddress, Address.IDExists, Address.IsMine], async function (req, res) 
{
    Address.SetDefault(req).then(function (result) 
    {
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/getdefault', async function (req, res) 
{
    Address.GetDefault(req).then(function (result) 
    {
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

/* 
 * @route: /info, information on an address
 *
 * @required:
 * 
 *           · req.body.id: Address ID
 */
 
router.post('/info', [VLR.IDToAddress, VLR.NeedsID, VLR.RequestDelete, Address.IDExists], async function (req, res) 
{
    Address.Info(req).then(function (result) 
    {
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/update', [VLR.NeedsID, VLR.RequestDelete, Etc.Convert], async function (req, res) 
{
    Address.Update(req).then(function (result) 
    {
        res.status(httpr.ok).send({ updated: true });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/delete', [VLR.NeedsID, VLR.IDToAddress, VLR.RequestDelete], async function (req, res) 
{
    Address.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/add', [Address.ValidAdd, Etc.UserConvert], async function (req, res) 
{
    Address.Add(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/get', [Etc.RangeCheck, VLR.RequestDelete], async function (req, res) 
{
    Address.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result["rows"] });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/exists', [VLR.NeedsID, VLR.RequestDelete], async function (req, res) 
{
    Address.IDExists(req).then(function (result) 
    {
        res.status(httpr.ok).send({ deleted: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({codes: error});
    })
});


module.exports = router;
