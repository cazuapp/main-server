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
var microtime    =  require('microtime');
var jwt          =  require('jsonwebtoken');
var Getters      =  require('../handlers/getters');
var Streams      =  require('../handlers/streams');
var User         =  require('../handlers/user');
var httpr        =  require('../run/httpr');
var Logs         =  require('../run/transport');
var base64       =  require('js-base64');

module.exports = 
{
    /* 
     * CountVerified(): Counts verified users according to a given status.
     * 
     * @parameters
     *        
     *          · body.id: User id to check.
     * 
     * @resolve
     * 
     *          · info_user: User data.
     *
     * @return
     *
     *          · protocol.no_exists: User ID empty.
     */

    CountVerified: async function(req, res, next)
    {
           return new Promise((resolve, reject) => 
           {
                      if (!req.body.value)
                      {
                           req.body.value = true;
                      }
                      
                      return models.user_info.count({ where: { verified: req.body.value }}).then(result => 
                      {
                             if (result != null) 
                             { 
                                   return resolve({ count_orders: result });
                             } 
                             else 
                             {
                                   return reject([protocol.no_exists]);
                             }
                      });
           });
    },
}