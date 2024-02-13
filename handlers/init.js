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

var microtime  =  require('microtime');
var httpr      =  require('../run/httpr');
var protocol   =  require('../run/protocol');
var Logs       =  require('../run/transport');
var Format     =  require('../handlers/format');

module.exports = 
{ 
    /*
     * Routes' middleware will be part of every route.
     * This middleware most likely will flush requests on a 
     * live manner to a redis server.
     */

    Routes: async function (req, res, next) 
    {
          Logs.info({ url: req.originalUrl, headers: req.headers }, process.env.ROUTE_STREAM);
          return next();
    },

    /*
     * SetHeaders(): Sets the headers of a given request.
     * 
     * @self
     *        
     *          · self.ip: Self assigned IP address from original request.
     *          · start: Time at which this request initiated.
     * 
     * @resolve
     * 
     *          · next(): Headers set.
     */

    SetHeaders: async function (req, res, next) 
    { 
          /* Starting time */
          
          req.start               =   microtime.now();
          req.self                =   {};
          req.self.calc           =   {};
          req.flags               =   {};
          req.origin              =   {};

          req.self.is_target      =   false;
          req.self.loaded         =   false;
          req.self.driver         =   false;
          
          /* Used to indicate if user has any admin flag */
          
          req.self.anyflag	  =   false;

          /* User ID 0 means no valid user has been assigned */
          
          req.self.user	          =   0;
          req.self.origin         =   0;
          req.self.lang           =   process.env.default_lang;
          req.self.ip             =   req.connection.remoteAddress;
          req.self.proxy          =   req.headers['x-forwarded-for'];
          req.self.version        =   req.headers['version'];
        
          req.flags.root_flags    =   0;
          req.flags.can_assign    =   0;
          req.flags_can_manage    =   0;
          req.origin.root_flags   =   0;
          req.origin.can_assign   =   0;
          req.origin.can_manage   =   0;
        
          return next();
    },

    /*
     * LiveDebug(): Debugs responses to user
     * 
     * @self
     *        
     * 
     * @resolve
     * 
     *          · next(): Debugged set.
     */
    
    LiveDebug: async function(req, res, next) 
    {
         var oldWrite = res.write,
         oldEnd       = res.end;

         var chunks = [];

         res.write = function (chunk) 
         {
               chunks.push(chunk);
               return oldWrite.apply(res, arguments);
         };

         res.end = function (chunk) 
         {
               if (chunk)
               {
                   chunks.push(chunk);
               }

               var body = Buffer.concat(chunks).toString('utf8');
               
               console.log("=================");
               Format.request(`${'req.path'.padEnd(19)} => ${req.originalUrl}`);
               Format.body(`${'req.body'.padEnd(18)} => ${JSON.stringify(req.body)}`);
               Format.response(`${'req.path'.padEnd(14)} => ${body}`);
               console.log("=================");

               oldEnd.apply(res, arguments);
         };

         return next();
    }
}
