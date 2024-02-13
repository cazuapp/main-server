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

var Promise     =  require('promise');
var Caching     =  require('../run/cache');
var protocol    =  require('../run/protocol');
var models      =  require('../databases/sql');
var Products    =  require('../handlers/products');
var Collections =  require('../handlers/collections');
var si        =   require('systeminformation');

module.exports = 
{ 
    /*
     * RunAll(): Runs all status
     * 
     * @resolve
     * 
     *          · [result]: Data.
     */

    RunAll: async function (req) 
    {
        return new Promise((resolve, reject) => {
            req.self.final = {};

            return Promise.all([si.currentLoad(), si.osInfo(), si.mem(), si.time()]).then((result) => {
                return resolve(result);
            });
        });
    },

    /*
     * Reset(): Resets Redis' cache
     * 
     * @resolve
     * 
     *          · protocok.ok: FlushAll command ran properly.
     */

    Reset: async function() 
    {
          await Caching.flushAll();
          return protocol.ok;
    },

    /*
     * Cache(): Pings cache server
     * 
     * @resolve
     * 
     *          · protocol.ok: Ping command ran properly.
     *
     * @reject
     *
     *          · protocol.down: Redis' server down.
     */

    Cache: async function() 
    {
          var result = await Caching.ping();

          if (result) 
          {
              return protocol.ok;
          }

          return [protocol.down];
    },

    /*
     * SQL(): Checks whether the SQL server is up.
     * 
     * @resolve
     * 
     *          · protocol.ok: SQL server running properly.
     *
     * @return
     *
     *          · protocol.down: SQL Server is down.
     */

    SQL: async function() 
    {
          return new Promise((resolve, reject) => 
          {
                try 
                {
                     models.sequelize.authenticate();
                     return resolve(protocol.ok);
                } 
                catch (error) 
                {
                     return reject([protocol.down]);
                }
          });
    },
    
    /*
     * CountAll(): Counts all items.
     * 
     * @resolve
     * 
     *          · [items]: All items calculated.
     *
     */
    
    CountAll: async function(req) 
    {
         return new Promise((resolve, reject) => 
         {
               return Promise.all([Products.CountProducts(req), Collections.CountCollections(req)]).then((values) => 
               {
                      return resolve(req.self.calc);
               });
         });
    },
    
}
