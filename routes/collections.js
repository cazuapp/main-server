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

var Promise      =  require('promise');
var httpr        =  require('../run/httpr');
var express      =  require('express');
var router       =  express.Router();
var protocol     =  require('../run/protocol');
var Settings     =  require('../handlers/settings');
var Collections  =  require('../handlers/collections');
var Records      =  require('../handlers/records');
var Products     =  require('../handlers/products');
var VLR          =  require('../handlers/validators');
var Etc          =  require('../handlers/etc');
var Counter      =  require('../handlers/counter');

router.post('/products/list', [Etc.RangeCheck, VLR.RequestDelete, Counter.Run("custom_collection")], async function (req, res) 
{
    Collections.GetProducts(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/products/search', [Etc.RangeCheck, VLR.RequestDelete, VLR.FormatValue, Counter.Run("custom_search_collection")], async function (req, res) 
{
    Collections.SearchProducts(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/list', [Etc.RangeCheck, VLR.RequestDelete, Counter.Run("all_collections")], async function (req, res) 
{
    Collections.List(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/search', [Etc.RangeCheck, VLR.RequestDelete, VLR.FormatValue, Counter.Run("search_collections")], async function (req, res) 
{
    Collections.Search(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/info', [Etc.RangeCheck, VLR.RequestDelete], async function (req, res) 
{
    Collections.Info(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});



module.exports = router;
