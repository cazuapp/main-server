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

var httpr        =  require('../run/httpr');
var express      =  require('express');
var router       =  express.Router();
var protocol     =  require('../run/protocol');
var Promise      =  require('promise');
var Session      =  require('../handlers/session');
var Getters      =  require('../handlers/getters');
var Products     =  require('../handlers/products');
var Startup      =  require('../handlers/startup');
var User         =  require('../handlers/user');
var VLR          =  require('../handlers/validators');
var Bans         =  require('../handlers/bans');

var TokenMiddle         =   [Session.SelfAuth, Getters.GetUser, Bans.IsBanned];
var LoginMiddle         =   [VLR.ValidEmail, VLR.ValidPassword, Session.OnPreLogin, User.CheckClosed, Bans.IsBanned, User.VerifyPass, Getters.GetUser];
var RegisterMiddlewares =   [VLR.ValidPassword, User.HashPass, VLR.ValidNames, VLR.ValidEmail, User.PreSignup];
var PasswdMiddle        =   [VLR.ValidEmail];
var UpdateMiddle        =   [VLR.ValidEmail, VLR.ValidNewPass, Session.OnPreLogin, User.HashPass, User.VerifyPass, User.SwitchUpdate, User.HashPass]

/* 
 * @route: /passwd, change of password.
 *
 * @required:
 * 
 *           · req.body.email: Changing email.
 *           · req.body.password: Current password
 *           · req.body.new: New password
 *
 */
 
router.post('/passwd', [UpdateMiddle], async function (req, res) 
{
    User.UpdatePass(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/forgot', [VLR.ValidEmail, User.RejectInvalidEmail, User.HasForgot], async function (req, res) 
{
    User.Forgot(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/forgot_ahead', [VLR.ValidEmail, VLR.ValidPassword, VLR.CheckSamePass, VLR.NeedsValue, User.RejectInvalidEmail, User.CheckForgot, User.HashPass, User.ForgotDelete], async function (req, res) 
{
    User.UpdatePass(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/login', [LoginMiddle], async function (req, res) 
{
    Session.Login(req).then(function (result) 
    {
        res.status(httpr.ok).send(result);
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/admin_login', [LoginMiddle, Session.IsAdmin], async function (req, res) 
{
    Session.Login(req).then(function (result) 
    {
        res.status(httpr.ok).send({ login: result.login, server: result.server, flags: req.flags });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/driver_login', [LoginMiddle, Getters.GetDriver], async function (req, res) 
{
    Session.Login(req).then(function (result) 
    {
        res.status(httpr.ok).send({ login: result.login, server: result.server, available: req.self.driver_available });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/token_login', [TokenMiddle], async function (req, res) 
{
    Session.Extend(req).then(function (result) 
    {
        res.status(httpr.ok).send(result);
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

router.post('/signup', [RegisterMiddlewares], async function (req, res) 
{
    User.Create(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
