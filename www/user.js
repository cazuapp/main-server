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
var User     =  require('../pubhandler/user');
var express  =  require('express');
var router   =  express.Router();
var etc      =  require('../handlers/etc');

/*
 * Confirms users' code.
 *
 * @example:
 *
 *         · http://127.0.0.1:3000/confirm/46f8138541800f6a92784c6f29487c3f/user/1
 */ 
 
router.get('/confirm/:code/user/:user', async function (req, res) 
{
    User.Confirm(req).then(function (result) 
    {
        res.status(httpr.ok).render('../html/confirm.ejs', etc.web_basics(req, { first: req.self.first, title: "Email verified" }));

    }).catch(function (error) 
    {
        res.status(httpr.bad_request).render('../html/confirm_failed.ejs', etc.web_basics(req, { title: "Unable to verify" }));
    })
});

/* 
 * Use this route for develop and test
 * new email ejs. This route should be commented before
 * publishing a new API 
 */
 
router.get('/test_email', async function (req, res) 
{
     res.status(httpr.ok).render('../emails/welcome.ejs', etc.web_basics(req, { first: "Elon", title: "Password reset!", code: "test_code", user: "1", order_id: 10 }));
});


router.get('/', async function (req, res) 
{
    res.redirect(req.app.get('url'));
});

module.exports = router;
