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

var Promise        =   require('promise');
var microtime      =   require('microtime');
var jwt            =   require('jsonwebtoken');
var Getters        =   require('../handlers/getters');
var Streams        =   require('../handlers/streams');
var User 	   =   require('../handlers/user');
var httpr 	   =   require('../run/httpr');
var models         =   require('../databases/sql');
var etc            =   require('../handlers/etc');

module.exports = 
{
    /*
     * List(): Perform an admin query to retrieve user information without search criteria.
     *
     * @resolve
     *
     *        · [results]: Matching users with additional information.
     *
     * @reject
     *
     *        · protocol.empty: No matching results found.
     */

    List: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.query("SELECT users.id, user_info.first, user_info.last, users.email, users.createdat as created  FROM users RIGHT JOIN user_info ON users.id = user_info.userid RIGHT JOIN user_roles ON users.id = user_roles.userid WHERE (user_roles.root_flags = true OR user_roles.can_manage = true OR user_roles.can_assign = true) LIMIT :limit OFFSET :offset",
            {
                replacements: 
                {
                    limit: req.self.limit,
                    offset: req.self.offset
                },
                
                type: models.sequelize.QueryTypes.SELECT
            })
            .then(results => 
            {
                if (results.length === 0) 
                {
                    return reject([protocol.empty]);
                } 
                else 
                {
                    return resolve(results);
                }
            })
            .catch(function (error) 
            {
                return reject([protocol.empty]);
            });
        });
    },

    /*
     * Search(): Perform an admin query to retrieve user information based on search criteria.
     *
     * @resolve
     *
     *        · [results]: Matching users with additional information.
     *
     * @reject
     *
     *        · protocol.empty: No matching results found.
     */

    Search: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.query("SELECT users.id, user_info.first, user_info.last, users.email, users.createdat as created FROM users RIGHT JOIN user_info ON users.id = user_info.userid RIGHT JOIN user_roles ON users.id = user_roles.userid WHERE (user_roles.root_flags = true OR user_roles.can_manage = true OR user_roles.can_assign = true) AND (user_info.first LIKE :search_query OR users.email LIKE :search_query) LIMIT :limit OFFSET :offset",
            {
                    replacements: 
                    {
                        search_query: req.body.value,
                        limit: req.self.limit,
                        offset: req.self.offset
                    },

                    type: models.sequelize.QueryTypes.SELECT
            })
            .then(results => 
            {
                if (results.length === 0) 
                {
                    return reject([protocol.empty]);
                } 
                else 
                {
                         return resolve(results);

                }
            })
            .catch(function (error) 
            {
                return reject([protocol.empty]);
            });
        });
    },

}