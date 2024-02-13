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
const multer    =  require("multer");

var router      =  express.Router();
var app         =  express();
var Session     =  require('../handlers/session');
var Products    =  require('../handlers/products');
var Settings    =  require('../handlers/settings');
var Collections =  require('../handlers/collections');
var VLR         =  require('../handlers/validators');
var Etc         =  require('../handlers/etc');
var Drivers     =  require('../handlers/drivers');
var User        =  require('../handlers/user');
var Pre         =  require('../handlers/pre');
var Variants    =  require('../handlers/variants');
var Admin       =  require('../handlers/admin');
var Favorites   =  require('../handlers/favorites');
var Records     =  require('../handlers/records');
var Orders      =  require('../handlers/orders');
var Bans        =  require('../handlers/bans');
var Counter     =  require('../handlers/counter');
var Headers     =  require('../handlers/header');

var Uploads     =  require('../handlers/uploads');

const upload = multer({ dest: "/var/tmp" });

router.post('/images/submit', upload.single("file"), async function (req, res) 
{
    Uploads.Submit(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
    console.log(error);
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/users/search', [VLR.FormatValue, Etc.RangeCheck, Counter.Run("search_users")], async function (req, res) 
{
    User.Search(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/users/list', [Etc.RangeCheck, Counter.Run("all_users")], async function (req, res) 
{
    User.GetList(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/variants/list', [Etc.RangeCheck, VLR.NeedsID, Counter.Run("all_variants"), Headers.Run("product_name")], async function (req, res) 
{
    Variants.GetAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ header: req.self.header != null ? req.self.header : undefined, counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/variants/search', [Etc.RangeCheck, VLR.NeedsID, VLR.FormatValue, Counter.Run("search_variants"), Headers.Run("product_name")], async function (req, res) 
{
    Variants.Search(req).then(function (result) 
    {
        res.status(httpr.ok).send({ header: req.self.header != null ? req.self.header : undefined, counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/variants/add', [Variants.ValidAdd, Etc.Convert, Products.IDExists], async function (req, res) 
{
    Variants.Add(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/variants/remove_image', [VLR.NeedsID, Variants.IDExists], async function (req, res) 
{
    Variants.RemoveImage(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

/* List all bans */

router.post('/bans/list', [Etc.RangeCheck, Counter.Run("all_bans")], async function (req, res) 
{
    Bans.List(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

/* Searches for bans */

router.post('/bans/search', [VLR.FormatValue, Etc.RangeCheck, Counter.Run("search_bans")], async function (req, res) 
{
    Bans.Search(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/admin/search', [VLR.FormatValue, Etc.RangeCheck, Counter.Run("search_admins")], async function (req, res) 
{
    Admin.Search(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result, counter: req.self.counter });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/admin/list', [Etc.RangeCheck, Counter.Run("all_admins")], async function (req, res) 
{
    Admin.List(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result, counter: req.self.counter });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/drivers/assign', [VLR.NeedsID], async function (req, res) 
{
    Drivers.Assign(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/drivers/unassign', [VLR.NeedsID], async function (req, res) 
{
    Drivers.Unassign(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/records/countproductviews', [Etc.RangeCheck], async function (req, res) 
{
    Records.CountProductViews(req).then(function (result) 
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
    Orders.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/orders/pendingsearch', [Etc.RangeCheck, VLR.NeedsParam, Orders.OrderCountSearch], async function (req, res) 
{
    Orders.PendingAllSearch(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/orders/getallpending', [Etc.RangeCheck, VLR.NeedsParam, Orders.OrderCountAllPending], async function (req, res) 
{
    Orders.OrderGetAllPending(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/orders/getby', [Etc.RangeCheck, VLR.NeedsValue], async function (req, res) 
{
    Orders.GetAllBy(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/orders/ready', async function (req, res) 
{
    Drivers.Ready(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/favorites/stats', async function (req, res) 
{
    Favorites.GroupWhere(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/products/stats', async function (req, res) 
{
    Products.GroupWhere(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/drivers/stats', async function (req, res) 
{
    Drivers.StatsBoth(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/get', [Etc.RangeCheck, VLR.NeedsKey], async function (req, res) 
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

router.post('/users/info', [VLR.NeedsID], async function (req, res) 
{
    User.AdvancedInfo(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result, queries: req.self.results });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/drivers/search', [Etc.RangeCheck, VLR.FormatValue, Counter.Run("search_drivers")], async function (req, res) 
{
    Drivers.Search(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/drivers/list', [Etc.RangeCheck, Counter.Run("all_drivers")], async function (req, res) 
{
    Drivers.GetAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ counter: req.self.counter, data: result, queries: req.self.results });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/users/count_today', async function (req, res) 
{
    User.CountToday(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/users/count_month', async function (req, res) 
{
    User.CountMonth(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/users/ordered_list', [Etc.RangeCheck, Pre.UserList], async function (req, res) 
{
    User.List(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/drivers/getavailable', [VLR.NeedStatus], async function (req, res) 
{
    Drivers.GetAvailable(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/drivers/getfullavailable', [VLR.NeedStatus, Etc.RangeCheck, Drivers.CountFullAvailable], async function (req, res) 
{
    Drivers.GetFullAvailable(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result, queries: req.self.results });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


router.post('/drivers/add', [VLR.NeedsID, Drivers.IsDriver], async function (req, res) 
{
    Drivers.Add(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/drivers/delete', [VLR.NeedsID], async function (req, res) 
{
    Drivers.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({data: result});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/settings/getall', async function (req, res) 
{
    Settings.GetSuperAll().then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/settings/get', [VLR.NeedsKey], async function (req, res) 
{
    Settings.Get(req).then(function (result) 
    {
        req.app.set(req.body.key, req.body.value);
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/settings/delete', [VLR.NeedsKey], async function (req, res) 
{
    Settings.Delete(req).then(function (result) 
    {
         req.app.set(req.body.key, null);
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/settings/set', [VLR.NeedsKey, VLR.NeedsValue], async function (req, res) 
{
    Settings.Set(req).then(function (result) 
    {
         req.app.set(req.body.key, req.body.bool == true ? Etc.as_bool(req.body.value) : req.body.value);
         res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
         res.status(httpr.bad_request).send({codes: error });
    })
});

router.post('/products/add', [Products.ValidAdd, Etc.Convert], async function (req, res) 
{
    Products.Add(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/products/update', [VLR.NeedsID, Etc.Convert], async function (req, res) 
{
    Products.Update(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/products/delete', [VLR.NeedsID], async function (req, res) 
{
    Products.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/collections/add', [Collections.ValidAdd, Etc.Convert], async function (req, res) 
{
    Collections.Add(req).then(function (result) 
    {
        res.status(httpr.ok).send({data: result});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/collections/delete', [VLR.NeedsID], async function (req, res) 
{
    Collections.Delete(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/collections/update', [VLR.NeedsID, Collections.IDExists, Etc.Convert], async function (req, res) 
{
    Collections.Update(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/orders/stats', async function (req, res) 
{
    Orders.OrderAll(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});


module.exports = router;
