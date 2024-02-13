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

var httpr        =   require('../run/httpr');
var express      =   require('express');
var router       =   express.Router();
var Bans         =   require('../handlers/bans');
var Locations    =   require('../handlers/locations');
var Favorites    =   require('../handlers/favorites');
var Etc          =   require('../handlers/etc');
var Collections  =   require('../handlers/collectionse');
var Products     =   require('../handlers/products');

router.post('/bans/removeall', [], async function (req, res) 
{
    Bans.RemoveAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/drivers/removeall', [], async function (req, res) 
{
    Drivers.RemoveAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/locations/removeall', [], async function (req, res) 
{
    Locations.RemoveAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/products/removeall', [], async function (req, res) 
{
    Products.RemoveAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/collections/removeall', [], async function (req, res) 
{
    Collections.RemoveAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/favorites/removeall', [], async function (req, res) 
{
    Favorites.RemoveAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


module.exports = router;
