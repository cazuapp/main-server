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

var Promise = require('promise');
var protocol = require('../run/protocol');
var models = require('../databases/sql');
var Cache = require('../run/cache');
var Etc = require('../handlers/etc');

module.exports = { /*
     * IsTokenOut(): Checks whether a given JWT token is banned.
     * 
     * @parameters
     *        
     *          · 
     * 
     * @resolve
     * 
     *          · 
     *
     * @return
     *
     *          · 
     */

    IsTokenOut: async function (req, res, next) {
        const header = req.headers["authorization"];

        if (typeof header !== 'undefined') {
            const bearer = header.split(" ");
            const token = bearer[0];

            var string = "bans:token:" + token;
            var result = await Cache.get(string);

            if (! result) {
                return next();
            }
        }

        return res.status(httpr.invalid_token).send({
            codes: [protocol.token_banned]
        });
    },

    /*
      * BanToken(): Bans a token on redis server.
      * 
      * @parameters
      *        
      *          ·  token: token to ban.
      *          ·  userid: User to ban.
      */

    BanToken: async function (token, userid) {
        var string = "bans:token:" + token;
        var value = userid + ":" + Date.now();

        await Cache.set(string, value);
        await Cache.expire(string, Number(process.env.EXPIRES));
    },

    ResetRequest: async function (userid) {},

    /*
     * KeepLast(): Keep last login.
     * 
     * @parameters
     *        
     *          · 
     * 
     * @resolve
     * 
     *          · 
     *
     * @return
     *
     *          · 
     */

    KeepLast: async function (user) {
        var string = "logins:last:" + user;
        var value = Date.now();

        await Cache.set(string, value);
        await Cache.expire(string, 120);
    }


}
