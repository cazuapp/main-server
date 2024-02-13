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

var Cache = require('../run/cache');

module.exports = 
{ 
     /*
      * Flushes live data to a log server.
      * This function requires 'log' to be enabled.
      */

      Log: async function (msg, path = process.env.LIVE_STREAM) 
      {
              if (Number(process.env.LOGS) == 1) 
              {
                   await Cache.publish(path, msg);
              }
      }
}
