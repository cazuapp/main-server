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
var User       =  require('../handlers/user');
var Orders     =  require('../handlers/orders');
var Bans       =  require('../handlers/bans');
var Products   =  require('../handlers/products');

router.post('/count_products', [Etc.ConvertWhere], async function (req, res) 
{
    Products.CountWhere(req).then(function (result) 
    {
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/count_users', [Etc.ConvertWhere], async function (req, res) 
{
    User.CountWhere(req).then(function (result) 
    {
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/count_bans', [Etc.ConvertWhere], async function (req, res) 
{
    Bans.CountWhere(req).then(function (result) 
    {
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/count_orders', [Etc.ConvertWhere], async function (req, res) 
{
    Orders.CountWhere(req).then(function (result) 
    {
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
