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
var models    =  require('../databases/sql');
var protocol  =  require('../run/protocol');

module.exports = 
{ 
    /*
     * RootOrManager(): Check if an user has either root or manage flags.
     * 
     * @reject
     *
     *          · protocol.no_flags: No flags.
     */

    RootOrManager: function (req)
    {
          if (req.flags.root_flags == 1 || req.flags.can_manage == 1) 
          {
               return true;
          }
          
          return false;
    },
    
    /*
     * CanManage(): Check if can manage.
     * 
     * @reject
     *
     *          · protocol.cant_over: No flags/cannot override.
     */

    CanManage: async function (req, res, next) 
    {
        if (req.self.is_target == 1) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.cant_over] });
        }

        if (module.exports.RootOrManager(req) == true)
        {
               return next();
        }
        
        return res.status(httpr.bad_request).send({ codes: [protocol.no_flags] });
    },

    /*
     * KillWhenPriv(): Kills an user' connection if holding
     *                 any flags.
     * 
     * @reject
     *
     *          · protocol.flags_provided: Flags provided.
     */

    KillWhenPriv: async function (req, res, next) 
    {
        if (req.origin.root_flags == 1) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.flags_provided] });
        }

        if (req.origin.can_manage == 1) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.flags_provided] });
        }

        if (req.origin.can_assign == 1) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.exists] });
        }

        return next();
    },

    /*
     * CanAssign(): Check if can assign.
     * 
     * @reject
     *
     *          · protocol.no_flags: No flags.
     */

    CanAssign: async function (req, res, next) 
    {
        if (! req.self.is_target) 
        {
            return next();
        }

        if (req.origin.root_flags == 1) 
        {
            return next();
        }

        if (req.origin.can_assign == 1) 
        {
            return next();
        }

        return res.status(httpr.bad_request).send({ codes: [protocol.no_flags] });
    },

    /*
     * CanRoot(): Check if can do root.
     * 
     * @reject
     *
     *          · protocol.no_flags: No flags.
     */

    CanRoot: async function (req, res, next) 
    {
        if (req.self.is_target == 1) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.cant_over] });
        }

        if (req.flags.root_flags == 1) 
        {
            return next();
        }

        return res.status(httpr.bad_request).send({ codes: [protocol.no_flags] });
    }

}
