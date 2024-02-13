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

var Promise   =  require('promise');
var httpr     =  require('../run/httpr');
var protocol  =  require('../run/protocol');
var models    =  require('../databases/sql');
var Cache     =  require('../run/cache');

module.exports = 
{
    /*
     * RemoveAll(): Remove all locations.
     *
     * @resolve
     *
     *        · protocol.ok: All locations removed.
     */

    RemoveAll: async function (req, res, next) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.user_locations.destroy({ where: { }, truncate: true }).then(result => 
                {
                     return resolve(protocol.ok);
                });
          });
    },

    /*
     * Get(): Retrieves an user' location.
     * 
     * @parameters
     *        
     *          · body.id: User id to retrieve.
     * 
     * @resolve
     * 
     *          · protocol.empty: Empty return.
     *
     * @return
     *
     *          · [result]: Users' location
     */
    
    Get: async function(req)
    {
           return new Promise((resolve, reject) => 
           {
                   return models.user_locations.findOne({ where: { userid: req.body.id }}).then(result => 
                   {
                             return resolve({ location: result });
                   });
           });
    },
}
