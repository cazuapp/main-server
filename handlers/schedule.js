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

var Promise    =  require('promise');
var httpr      =  require('../run/httpr');
var protocol   =  require('../run/protocol');
var models     =  require('../databases/sql');

module.exports = 
{
    /*
     * ValidSet(): Checks whether new schedule rule has the right parameters.
     * 
     * @parameters
     *        
     *         · day: 
     * 
     * @resolve
     * 
     *          · next(): Parameters provided.
     *
     * @return
     *
     *          · protocol.missing_param: Some parametes are missing.
     */

    ValidSet: async function (req, res, next) 
    {
           if (!req.body.day || !req.body.start_time || !req.body.stop_time) 
           {
               return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
           }
           
           return next();
    },
    
    SetDefaults: async function (req, res, next) 
    {	
          return new Promise((resolve, reject) =>
          {
                   var days        =  req.body.items;

                   for (const day of days) 
                   { 

                   }
           });
    },
    
    IsOpen: async function (req, res, next)
    {
    
    }
}