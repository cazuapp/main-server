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

const kleur = require('kleur');

module.exports = 
{
    /* Adds info tag */
    
    info: function (text) 
    {
        console.log('[' + kleur.blue().bold(' INFO ') + ']' + " " + text);
    },

    /* Adds ok tag */ 
    
    ok: function (text) 
    {
        console.log('[' + kleur.green().bold(' OK ') + ']' + " " + text);
    },

    /* Error tag */
    
    error: function (text) 
    {
        console.log('[' + kleur.red().bold(' ERROR ') + ']' + " " + text);
    },

    /* Response tag */ 
    
    response: function (text) 
    {
        console.log('[' + kleur.blue(' RESPONSE ') + ']' + " " + text);
    },
    
    /* Body tag */
    
    body: function (text) 
    {
        console.log('[' + kleur.blue(' BODY ') + ']' + " " + text);
    },

    /* REQ tag */ 
    
    request: function (text) 
    {
        console.log('[' + kleur.blue(' REQ ') + ']' + " " + text);
    },

    /* Debug tag */ 
    
    debug: function (text) 
    {
        console.log('[' + chalk.red().bold(' DEBUG ') + ']' + " " + text);
    },
   
    /* Converts a port to int */
    
    normalizePort: function (val) 
    {
        var port = parseInt(val, 10);

        if (isNaN(port)) 
        {
            return val;
        }

        if (port >= 0) 
        {
            return port;
        }

        return false;
    }
}
