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

var Promise       =  require('promise');
var microtime     =  require('microtime');
var jwt           =  require('jsonwebtoken');
var Getters       =  require('../handlers/getters');
var Streams       =  require('../handlers/streams');
var User          =  require('../handlers/user');
var httpr         =  require('../run/httpr');
var Logs          =  require('../run/transport');
var base64        =  require('js-base64');

module.exports = 
{
    /*
     * IsAdmin(): Checks whether user has any kind of flags.
     * 
     * @parameters
     *        
     *           · self.anyflag: Whether user has any admin flags.
     *       
     * @resolve
     *
     *          ·  next(): User has flags.
     *
     * @return
     *
     *         ·   no_admin: No admin.
     */

    IsAdmin: async function (req, res, next) 
    {
        if (req.self.anyflag == null || req.self.anyflag != true) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.no_admin] });
        }

        return next();
    },

    /*
     * IsExpired(): Checks whether a given JWT token is expired.
     * 
     * @parameters
     *        
     *          · token: Token to verify.
     * 
     * @resolve
     * 
     *          · [data]: JWT token data.
     *
     * @return
     *
     *          · protocol.token_expired: Token has expired.
     */

    IsExpired: async function (token) 
    {
        return new Promise((resolve, reject) => 
        {
            return jwt.verify(token, process.env.JWT_KEY, function (error, data) 
            {
                if (error) 
                {
                    return reject(err);
                }

                const ts = Math.floor(Date.now() / 1000);

                if (ts >= data.exp) 
                {
                    return reject(protocol.token_expired);
                }

                return resolve(data);
            });
        });
    },

    /*
    * SessionMaker(): Returns and create new token.
    *
    * @resolve
    *
    *         · { json }: User and server data.
    * 
    * @reject:
    *
    *         · protocol.unable_to_log_in: Unable to log in.
    */

    SessionMaker: async function (req, jwt = true) 
    {
        var returning = 
        {
            id: req.self.user,
            email: req.self.email,
            first: req.self.first,
            last: req.self.last,
            active: req.self.active,
            phone: req.self.phone,
            verified: req.self.verified,
            created: req.self.created
        };

        if (jwt) 
        {
            returning["token"] = module.exports.GenerateToken(req.self.user, microtime.now(), process.env.EXPIRES);
        }

        var server = 
        {
            version: process.env.VERSION,
            date: Date.now(),
            expires: Number(process.env.EXPIRES)
        };

        return { "login": returning, "server": server };
    },

    /*
     * WhoAmi(): Returns data about current session based on a provided token.
     *
     * @resolve
     *
     *         · { data }: User and server data.
     * 
     * @reject:
     *
     *         · protocol.unable_to_log_in: Unable to log in.
     */

    WhoAmi: async function (req) 
    {
         return new Promise((resolve, reject) => 
         {
              if (req.self.user) 
              {
                  return resolve(module.exports.SessionMaker(req, false));
              } 
              else 
              {
                  return reject([protocol.unable_to_log_in]);
              }
         });
    },

    /*
     * Login(): Returns login data. At this stage, the route's middlewares
     * should have checked a provided email and password in the body.
     *
     * @resolve
     *
     *         · { data }: Login parameters.
     *
     * @resolve
     *
     *         · protocol.unable_to_log_in: Unable to log in.
     */

    Login: async function (req) 
    {
        return new Promise((resolve, reject) => 
        { 
            /* All users' email should be defined by now */

            if (req.self.email) 
            {
                 return resolve(module.exports.SessionMaker(req, true));
            } 
            else 
            {
                return reject([protocol.unable_to_log_in]);
            }
        });
    },

    /* 
     * Extend(): Extends the lifehood of a JWT token, by creating a new one.
     *
     * @parameters
     *
     *         · self.user: User' id
     *
     * @return
     *
     *         · { server }: Generated token.
     */

    Extend: async function (req) 
    {
        var server = 
        {
             date: Date.now(),
             id: req.self.user,
             token: module.exports.GenerateToken(req.self.user, microtime.now(), Number(process.env.EXPIRES)),
             expires: Number(process.env.EXPIRES)
        };

        return { "extend": server };
    },

    /*
     * AuthNone(): Middleware used in order to disconnect a client that has
     * provided a JWT token, when it is not required to do so.
     *
     * @header:
     *
     *          · authorization: Checks whether a header token has been provided.
     */

    AuthNone: async function (req, res, next) 
    {
        const header = req.headers["authorization"];

        if (typeof header !== 'undefined') 
        {
            return res.status(httpr.invalid_token).send({ codes: [protocol.token_provided] });
        }

        return next();
    },

    /*
     * Required(): Middleware that makes it mandatory to provide a JWT token
     * in order to access a given route. This function will verify whether
     * a jwt token is valid and then move into the API call.
     *
     * @parameters
     *
     *           · req.headers.authorization: Bearer token to be processed.
     */

    Required: async function (req, res, next) 
    {
        const header = req.headers["authorization"];

        if (typeof header !== 'undefined') 
        {
            const bearer = header.split(" ");
            const token = bearer[0];

            if (!token) 
            {
                return res.status(httpr.invalid_token).send({ codes: [protocol.empty] });
            }

            if (process.env.NODE_ENV == "production") 
            {
                 req.self.auth = base64.decode(token);
            }
            else 
            {
                 req.self.auth = token;
            }

            try 
            {
                const data = await module.exports.Verify(req);
                req.self.user = data["user"];
                return next();
            } 
            catch (error) 
            {
                Logs.error({ url: req.originalUrl, headers: req.headers, body: req.body, error: error, user: req.self.user }, process.env.ROUTE_STREAM);
                return res.status(httpr.invalid_token).send({ codes : [error] });
            }

            return next();
        }

        /* No token has been provided */

        return res.status(httpr.token_required).send();
    },

    /* 
     * GenerateToken(): Generates a new jwt token.
     *
     * A jwt signature contains an user's unique, a microtime-based unique variable
     * and an unique identifier (uuid).
     *
     * @parameters
     *
     *         · user: User to generate a token with.
     *
     * @return
     *
     *         · JWT key.
     */

    GenerateToken: function (user) 
    {
        return jwt.sign({ user: user }, process.env.JWT_KEY, 
        {
            expiresIn: Number(process.env.EXPIRES)
        });
    },

    /* 
     * SelfAuth(): Wrapper to log in an user with a JWT token.
     *
     * @parameters
     *
     *         · body.auth: Self provided token.
     *
     * @reject
     *
     *        · invalid_token: Invalid token.
     */

    SelfAuth: async function (req, res, next) 
    {
        if (!req.body.auth) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.bad_format] });
        }

        req.self.auth = req.body.auth;

        try 
        {
             const data = await module.exports.Verify(req);
             req.self.user = data["user"];
             return next();
        } 
        catch (error) 
        {
             Logs.error({ url: req.originalUrl, headers: req.headers, body: req.body, error: error, user: req.self.user }, process.env.ROUTE_STREAM);
             return res.status(httpr.invalid_token).send({codes: [error]});
        }

        return next();
    },

    /* 
     * Verify(): Verifies token.
     *
     * Checks whether a JWT is valid.
     *
     * @parameters
     * 
     *         · self.auth: Token provided.
     *       
     * @reject
     *
     *         · JsonWebTokenError: Invalid token.
     *
     *         · TokenExpiredError: Token has expired.
     *
     * @return
     *
     *         · [data]: Resolved data.
     */

    Verify: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            return jwt.verify(req.self.auth, process.env.JWT_KEY, function (err, data) 
            {
                if (err) 
                {
                    if (err.name && err.name == "TokenExpiredError") 
                    { 
                        /* Expired. */
                        
                        return reject(protocol.expired_token);
                    }

                    if (err.name && err.name == "JsonWebTokenError") 
                    { 
                        /* Invalid token. */

                        return reject(protocol.invalid_token);
                    }

                    /* Any other error */

                    return reject(protocol.token_err);
                }

                return resolve(data);
            })
        });
    },

    /*
     * OnPreLogin(): Middle used before login into a new session.
     *
     * @resolve
     *
     *         · empty: Email not found.
     */

    OnPreLogin: async function (req, res, next) 
    {
        return User.EmailExists(req).then(function (result) 
        {
            req.self.password = result.password;
            req.self.user = result.id;
            req.self.active = result.active;

            return next();
        })
        .catch(function (error) 
        {
             Logs.error({ url: req.originalUrl, headers: req.headers, body: req.body, error: error }, process.env.ROUTE_STREAM);
             return res.status(httpr.bad_request).send({ codes: [protocol.empty] });
        })
    },

    /*
     * Logout(): Bans a token from session.
     *
     * @resolve
     *
     *         · protocol.ok: Token has been added to the ban list.
     */

    Logout: async function (req) 
    {
         return new Promise((resolve, reject) => 
         {
             Streams.BanToken(req.self.auth, req.self.user);
             return resolve(protocol.ok);
         });
    }
}
