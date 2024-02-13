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
var geoip      =  require('geoip-lite');
var cmeta      =  require('getcountry-metadata');
var protocol   =  require('../run/protocol');
var microtime  =  require('microtime');
var etc        =  require('../handlers/etc');

module.exports = 
{
    /*
     * GetKey(): Looks up for secret key.
     *
     * @resolve
     *
     *         · next(): Secret key matches.
     *
     * @reject
     *
     *         · nokeys: Key not provided or invalid.
     *
     */
    
    GetKey: async function (req, res, next)
    {
          if (process.env.NODE_ENV != "production")
          {
               return next();
          }
         
          const header = req.headers["secret"];

          if (typeof header !== 'undefined') 
          {
               if (header == process.env.apikey)
               {
                     return next();
               }
               
               return res.status(httpr.token_required).send({ codes: [protocol.nokeys]});
          }
         
          return res.status(httpr.token_required).send({ codes: [protocol.nokeys]});
         
    },
    
    /*
     * InMaintaince(): Checks whether a given instance is under maintaince.
     *                 This function will be skipped if requesting user has any 
     *                 flags.
     *             
     * @resolve
     *
     *             · next(): No maintaince.
     */

    InMaintaince: async function (req, res, next)
    {
          if (req.self.anyflag != null || req.self.anyflag == true)
          {
               return next();
          }
          
          if (req.app.get('maint') == true)
          {
                return res.status(httpr.maint).send();
          }
            
          return next();
    },
    
    /*
     * Lookup(): Looks up for data provided a given user, also, sets meta data
     *           to be defined and sent back to the logging user.
     *
     * @resolve
     *
     *         · next(): Passing of lookup.
     */

    Lookup: async function (req, res, next) 
    {
          return new Promise((resolve, reject) => 
          {
                 const geo                 =    geoip.lookup(req.self.ip);
                 req.meta                  =    {};
 
                 if (geo != null) 
                 {
                      req.meta.geo          =    geo["country"];
                      req.meta.phonecode    =    cmeta.getCountry(req.meta.geo).phone_code;
                      req.meta.lang         =    cmeta.getCountry(req.meta.geo).languages[0]["iso2"];
                 }

                 req.meta.latest           =    process.env.LATEST;
                 req.meta.url              =    req.app.get('url');
                 req.meta.online           =    etc.as_bool(req.app.get('online'));
                 req.meta.maint	           =    etc.as_bool(req.app.get('maint'));
                 req.meta.orders           =    etc.as_bool(req.app.get('orders'));
                 req.meta.pong	           =    microtime.now() - req.start;
                 req.meta.use              =    process.env.VERSION;

                 return next();
          });
    }
}
