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

var Promise = require("promise");
var httpr = require("../run/httpr");
var protocol = require("../run/protocol");
var models = require("../databases/sql");
var etc = require("../handlers/etc");

module.exports = 
{
      /*
       * UserList(): Pre defines a query when retrieving users list.
       *
       * @parameters
       *
       *          · body.[all params]: User' email.
       *
       */

      UserList: async function (req, res, next) 
      {
            var order = 0;

            if (!req.body.by) 
            {
                  order = 0;
            } 
            else 
            {
                  if (req.body.by == "alpha") 
                  {
                        order = 1;
                  }
            }

            /* Orders by user created, desc */

            if (order == 0) 
            {
                  req.self.query = "SELECT *, users.createdat as user_created from users RIGHT JOIN user_info ON users.id = user_info.userid LEFT JOIN user_roles ON users.id = user_roles.userid  ORDER by users.createdat DESC LIMIT :limit OFFSET :offset";
            }

            if (order == 1) {
                  req.self.query =
                        "SELECT *, users.createdat as user_created from users RIGHT JOIN user_info ON users.id = user_info.userid LEFT JOIN user_roles ON users.id = user_roles.userid  ORDER by user_info.last ASC LIMIT :limit OFFSET :offset";
            }

            return next();
      },
};