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
var protocol       =   require('../run/protocol');
var models         =   require('../databases/sql');
var httpr          =   require('../run/httpr');
var validator      =   require("email-validator");
var Etc            =   require('../handlers/etc');
var Privs          =   require('../handlers/privs');
var counters       =   require('../run/counters');

module.exports = 
{
    /*
     * Run(): Runs a determined counter as provided by the .counter env file.
     *                 
     * @return
     * 
     *         · resolve: Counter info
     */

     Run: function (cmd) 
     { 
           return function (req, res, next) 
           {  
                 const query = counters[cmd].toString();

                 return models.sequelize.query(query,
                 {
                        replacements: 
                        {
                            id: req.body.id,
                            search_query: req.body.value,
                            limit: req.self.limit,
                            offset: req.self.offset,
                            deleted: req.self.delete,
                        },
                   
                        type: models.sequelize.QueryTypes.SELECT

                 })
                 .then(results => 
                 { 
                       if (results.length == 0) 
                       {
                            /* Returns 0 if no items found */
                           
                            req.self.counter = 0;
                       } 
                       else 
                       {
                            req.self.counter = results[0]["counter"];
                       }

                       return next();
                 })
           }
     },

}
