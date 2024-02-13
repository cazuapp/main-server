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

var httpr    =  require('../run/httpr');
var express  =  require('express');
var router   =  express.Router();
var Session  =  require('../handlers/session');
var User     =  require('../handlers/user');
var Orders   =  require('../handlers/orders');
var Etc      =  require('../handlers/etc');
var VLR      =  require('../handlers/validators');
var Session  =  require('../handlers/session');
var Holds    =  require('../handlers/holds');
var Stats    =  require('../handlers/stats');

router.post('/count_verified', async function (req, res) 
{
    Stats.CountVerified(req).then(function (result) 
    {
        res.status(httpr.ok).send({ lastlogin: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/get_defaults', async function (req, res) 
{
    User.GetDefaults(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/stats', async function (req, res) 
{
    User.Stats(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/logout', async function (req, res) 
{
    /* Execute the logout operation in the 'Session' module */

    Session.Logout(req).then(function (result) 
    {
        res.status(httpr.ok).send({ close: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    });
});

router.post('/close', [Orders.HasAny], async function (req, res) 
{
    User.Close(req).then(function (result) 
    {
        res.status(httpr.ok).send({ close: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/holds/get', async function (req, res) 
{
    Holds.Get(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/update', [Etc.SmartConvert(["id", "salt", "active", "verified", "createdat", "updatedat", "userid"])], async function (req, res) 
{
    User.Update(req).then(function (result) 
    {
        res.status(httpr.ok).send({data: result});
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

/* Updates email: Handle POST requests to '/update_email' */

router.post('/update_email', [VLR.ValidEmail, User.EmailExistsAsMiddle], async function (req, res) 
{
    User.UpdateEmail(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    });
});

/* Get user identity: Handle POST requests to '/whoami' */

router.post('/whoami', async function (req, res) 
{
    Session.WhoAmi(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result, flags: req.flags });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    });
});

router.post('/last', async function (req, res) 
{
    User.LastLogin(req).then(function (result) 
    {
        res.status(httpr.ok).send({ lastlogin: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
