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
var Favorites  =  require('../handlers/favorites');
var Etc        =  require('../handlers/etc');
var VLR        =  require('../handlers/validators');
var Records    =  require('../handlers/records');
var Products   =  require('../handlers/products');

router.post('/check', [VLR.NeedsID], async function (req, res) 
{
    Favorites.Check(req, res).then(function (result) 
    {
        res.status(httpr.ok).send({ result: true });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ result: false });
    })
});

router.post('/delete', [VLR.NeedsID], async function (req, res) 
{
    Favorites.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({ deleted: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/add', [VLR.NeedsVariant, Etc.UserConvert], async function (req, res) 
{
    Favorites.Add(req, res).then(function (result) 
    {
        res.status(httpr.ok).send({ added: true, id: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/smart', [VLR.NeedsID, Products.IDExists, Favorites.CheckMiddle], async function (req, res) 
{
    Favorites.Smart(req).then(function (result) 
    {
        res.status(httpr.ok).send({ id: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/getjoin', [Etc.RangeCheck, Favorites.CountGetJoin], async function (req, res) 
{
    Favorites.GetJoin(req).then(function (result) 
    {
        res.status(httpr.ok).send({ rows: result, counter: req.self.results });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/get', [Etc.RangeCheck], async function (req, res) 
{
    Favorites.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/remove_user', async function (req, res) 
{
    Favorites.RemoveUser(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


module.exports = router;
