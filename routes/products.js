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
var Favorites    =  require('../handlers/favorites');
var Products     =  require('../handlers/products');
var Etc          =  require('../handlers/etc');
var VLR          =  require('../handlers/validators');

router.post('/info', [VLR.NeedsID, Records.Products, Favorites.CheckMiddle, VLR.RequestDelete], async function (req, res) 
{
    Products.Info(req).then(function (result) 
    {
        res.status(httpr.ok).send({ data: result, favorite: req.self.favorite == true ? 1 : 0, images: req.self.images });
    })
    .catch(function (error) 
    {
        res.status(httpr.bad_request).send({ codes: error });
    })
});



module.exports = router;
