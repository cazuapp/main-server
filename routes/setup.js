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
var VLR          =  require('../handlers/validators');
var User         =  require('../handlers/user');

var RegisterMiddlewares =  [VLR.ValidPassword, User.HashPass, VLR.ValidNames, VLR.ValidPhone, VLR.ValidEmail, User.PreSignup];

router.post('/install', [Startup.CheckIfInstalled, RegisterMiddlewares], async function (req, res) 
{
    Startup.Setup(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});

module.exports = router;
