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
var protocol    =  require('../run/protocol');
var models      =  require('../databases/sql');
var Setters     =  require('../handlers/setters');

module.exports = 
{ 
    /*
     * GetLocation(): Returns last recorded location about an user.
     * 
     * @resolve
     *         
     *         · next: Data found.
     */

    GetLocation: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            req.self.lat = 0;
            req.self.lon = 0;

            return models.user_locations.findOne({ where: { userid: req.self.user }}).then(result => 
            {
                if (result != null) 
                {
                    const data = result;
                    req.self.lat = data.lat;
                    req.self.lon = data.lon;
                }

                return next();
            });

            return next();
        });
    },

    /*
     * GetDriver(): Returns information about a driver.
     * 
     * @reject
     *
     *          · protocol.no_driver: User is not a driver.
     * @resolve
     *         
     *         · next: Data found.
     */

    GetDriver: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.drivers.findOne({ where: { userid: req.self.user }}).then(result => 
            {
                if (result == null) 
                {
                    return res.status(httpr.bad_request).send({ codes: [protocol.no_driver] });
                }

                req.self.driver = true;
                req.self.driver_available = result.available;
                return next();
            });

            return next();
        });
    },

    /*
     * GetUser(): Returns information about a given user.
     * 
     * @resolve
     * 
     *          · next(): Parameters provided.
     *
     * @reject
     *
     *          · protocol.no_assoc: No user data found.
     */

    GetUser: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        { 
            /* Check if data was already loaded */

            if (req.self.is_target == false && req.self.loaded == 1) 
            {
                return next();
            }

            /* It's target */

            if (req.self.is_target) 
            {
                if (req.origin.root_flags || req.origin.can_manage || req.origin.can_assign || req.origin.can_addmanagers) 
                {
                    req.self.anyflag = true;
                }

                req.origin.root_flags = req.flags.root_flags;
                req.origin.can_manage = req.flags.can_manage;
                req.origin.can_assign = req.flags.can_assign;
                req.origin.can_addmanagers = req.flags.can_addmanagers;
            }

            return models.sequelize.query("SELECT *, users.createdat as user_created from users RIGHT JOIN user_info ON users.id = user_info.userid LEFT JOIN user_roles ON users.id = user_roles.userid  where users.id = ? LIMIT 1", 
            {
                replacements: [req.self.user],
                type: models.sequelize.QueryTypes.SELECT
            })
            .then(user => 
            {
                /* No assoc is returned if user is not found */
                
                if (user == null || !user) 
                {
                    return res.status(httpr.bad_request).send({ codes: [protocol.no_assoc] });
                } 
                else 
                {
                    const data = user[0];

                    req.self.loaded = 1;
                    req.self.email = data.email;
                    req.self.first = data.first;
                    req.self.last = data.last;
                    req.self.verified = data.verified;
                    req.self.phone = data.phone;
                    req.self.created = data.user_created.toLocaleDateString("en-US");

                    req.flags.root_flags = data.root_flags;
                    req.flags.can_manage = data.can_manage;
                    req.flags.can_assign = data.can_assign;
                    req.flags.can_addmanagers = data.can_addmanagers;

                    if (!req.self.is_target) 
                    {
                        if (req.flags.root_flags || req.flags.can_manage || req.flags.can_assign || req.flags.can_addmanagers) 
                        {
                            req.self.anyflag = true;
                        }
                    }

                    if (req.self.phone == null) 
                    {
                        req.self.phone = "";
                    }

                    return next();
                }
            })
            .catch(function (error) 
            {
                return res.status(httpr.bad_request).send({ codes: [protocol.unknown_error] });
            });

        });
    }
}
