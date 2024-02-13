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
var headers        =   require('../run/headers');

module.exports = 
{
    /*
     * Run(): Runs a determined hedaer as provided by the .header file.
     *                 
     * @return
     * 
     *         · resolve: Header information.
     */

     Run: function (cmd) 
     { 
           return function (req, res, next) 
           {  
                 const query = headers[cmd].toString();

                 return models.sequelize.query(query,
                 {
                        replacements: 
                        {
                            id: req.body.id,
                        },
                   
                        type: models.sequelize.QueryTypes.SELECT

                 })
                 .then(results => 
                 { 
                       if (results.length == 0) 
                       {
                            /* Returns 0 if no items found */
                           
                            req.self.header = null;
                       } 
                       else 
                       {
                            req.self.header = results[0]["header"];
                       }

                       return next();
                 })
           }
     },

}
