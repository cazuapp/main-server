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

var Promise    =  require('promise');
var md5        =  require('md5');
var protocol   =  require('../run/protocol');
var models     =  require('../databases/sql');
var httpr      =  require('../run/httpr');
var validator  =  require("email-validator");

module.exports = 
{
        /* Returns facebook + username */
        
        do_fb: function (username) 
        {
            return "http://www.facebook.com/" + username;
        },

        /* Returns instagram + username */
        
        do_instagram: function (username) 
        {
            return "http://www.instagram.com/" + username;
        },
        
        /* Returns twitter + username */
        
        do_twitter: function (username) 
        {
            return "http://www.twitter.com/" + username;
        },

        /*
         * web_basics: Merges basic data plus custom json.
         * 
         * @resolve
         * 
         *          · { final }: Json containing formatted data to be imported
         *                       into a ejs file.
         */

        web_basics: function (req, json) 
        {
            var data = {};

            data['base_url'] = req.app.get('base_url');
            data['url'] = req.app.get('url');
            data['year'] = new Date().getFullYear();
            data['storename'] = req.app.get('storename');
            data['address'] = req.app.get('store_address');
            data['instagram'] = module.exports.do_instagram(req.app.get('instagram'));
            data['facebook'] = module.exports.do_fb(req.app.get('facebook'));
            data['twitter'] = module.exports.do_twitter(req.app.get('twitter'));
            data['phone'] = req.app.get('phone');
            data['phone_code'] = req.app.get('phone_code');
            data['tax'] = req.app.get('tax');

            var final = Object.assign({}, data, json);

            return final;
        },

       /*
        * sleep(): Sleep X seconds
        * 
        * @parameters
        *        
        *          · ms: Miliseconds to sleep
        * 
        * @resolve
        * 
        *          · true or false.
        */

        sleep: function (ms) 
        {
            return new Promise((resolve) => 
            {
                setTimeout(resolve, ms);
            });
        },

       /*
        * Wait(): Sleep X seconds
        * 
        * @resolve
        * 
        *          · next: Slept for X seconds.
        */

        Wait: async function (req, res, next) 
        {
            await module.exports.sleep(5000);
            return next();
        },

       /*
        * round2(): Rounds a number by 2 decimals.
        * 
        * @parameters
        *        
        *          · value: Value to check against.
        * 
        * @resolve
        * 
        *          · true or false.
        */

        round2: function (value) 
        {
            return Math.round((value + Number.EPSILON) * 100) / 100;
        },

       /*
        * as_bool(): Returns as string as boolean.
        * 
        * @parameters
        *        
        *          · value: Value to check against.
        * 
        * @resolve
        * 
        *          · true or false.
        */

        as_bool: function (value) 
        {
            if (value == true || value == 1 || value == "on" || value == "true" || value == "yes") 
            {
                return true;
            }

            return false;
        },

       /*
        * HasSpace(): Whether a string has an space
        * 
        * @parameters
        *        
        *          · sentence: String to check.
        * 
        * @resolve
        * 
        *          · true or false.
        */

        HasSpace: function (sentence) 
        {
            return sentence.indexOf(" ") >= 0;
        },

       /*
        * prettydate(): Formats a date.
        * 
        * @parameters
        *        
        *          · original: Original date.
        * 
        * @resolve
        * 
        *          · formatted: Formatted date.
        */

        prettydate: function (original) 
        {
            const options = 
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }

            return original.toLocaleDateString('en-US', options);
        },

       /*
        * makeid(): Creates a random string.
        * 
        * @parameters
        *        
        *          · length: Length of random string.
        * 
        * @resolve
        * 
        *          · result: Random string.
        */

        makeid: function (length, encode = false) 
        {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;

            for (var i = 0; i < length; i++) 
            {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            if (!encode) 
            {
                return result;
            } 
            else 
            {
                return md5(result);
            }
        },

       /*
        * makeint(): Creates a random int.
        * 
        * @parameters
        *        
        *          · length: Length of random int.
        * 
        * @resolve
        * 
        *          · result: Random int.
        */

        makeint: function (length, encode = false) 
        {
            var result = '';
            var characters = '123456789';
            var charactersLength = characters.length;

            for (var i = 0; i < length; i++) 
            {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            if (!encode) 
            {
                return result;
            } 
            else 
            {
                return md5(result);
            }
        },

       /*
        * is_number(): Runs a typeof number on a given string.
        * 
        * @parameters
        *       
        *          · value: Valeu to check.
        * 
        * @return
        * 
        *          · bool
        */

        is_number: function (value) 
        {
            return typeof value === 'number';
        },

       /*
        * RandomInt(): Random int number.
        * 
        * @parameters
        *        
        *          · min: Minimun number.
        *          · max: Number's limit.
        * 
        * @resolve
        * 
        *          · int: Random number.
        */

        RandomInt: function (min, max) 
        {
            min = Math.ceil(min);
            max = Math.floor(max);

            return Math.floor(Math.random() * (max - min)) + min;
        },

       /*
        * RangeCheck(): Checks whether a valid range is being set.
        * 
        * @parameters
        *        
        *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
        * 
        * @resolve
        * 
        *          · next(): Offset and Limit are in order and set.
        *
        * @return
        *
        *          · protocol.range_not_numeric: Range is not numeric.
        *          · invalid_range: Range is invalid.
        *          · range_to_big: Range is to large.
        */

        RangeCheck: async function (req, res, next) 
        { 
            /* Default range definition */

            req.self.offset = 0;
            req.self.limit = Number(process.env.DEFAULT_RANGE);

            if (req.body.offset) 
            {
                if (!isNaN(req.body.offset)) 
                {
                    req.self.offset = req.body.offset;
                } 
                else 
                {
                    return res.status(httpr.bad_request).send({ codes: [protocol.range_not_numeric] });
                }
            }

            if (req.body.limit) 
            {
                if (!isNaN(req.body.limit)) 
                {
                    req.self.limit = req.body.limit;
                } 
                else 
                {
                    return res.status(httpr.bad_request).send({ codes: [protocol.range_not_numeric] });
                }
            }

            if (req.self.limit < 0) 
            {
                return res.status(httpr.bad_request).send({ codes: [protocol.invalid_range] });
            }

            if (req.self.offset < 0) 
            {
                return res.status(httpr.bad_request).send({ codes: [protocol.invalid_range] });
            }

            if ((req.self.limit - req.self.offset) > Number(process.env.DEFAULT_RANGE) + 100) 
            {
                return res.status(httpr.bad_request).send({ codes: [protocol.range_too_big] });
            }

            req.self.range = (req.self.limit - req.self.offset);
            return next();
        },

       /*
        * ConvertWhere(): Converts body params to to self.params.
        * 
        * @parameters
        *        
        *          · req.body: All parameters will be passed onto req.self.params,
        *                      These include id, unlike convert.
        */

        ConvertWhere: async function (req, res, next) 
        {
            var final = {};

            for (var key in req.body) 
            {
                if (req.body.hasOwnProperty(key)) 
                { 
                    /* Both, ids and third requests should no go here. */

                    final[key] = req.body[key];
                }
            }

            var where = 
            {
                "where": final
            };

            req.self.params = where;
            return next();
        },

       /*
        * Convert(): Converts body params to to self.params, while removing
        *            req.body.id.
        * 
        * @parameters
        *        
        *          · req.body: All parameters will be passed onto req.self.params
        */

        Convert: async function (req, res, next) 
        {
            var final = {};

            for (var key in req.body) 
            {
                if (req.body.hasOwnProperty(key)) 
                { 
                    /* Both, ids and third requests should no go here. */

                    if (key == "id" || key == "createdat" || key == "updatedat") 
                    {
                        continue;
                    }

                    final[key] = req.body[key];
                }
            }

            req.self.params = final;
            return next();
        },

       /*
        * UserConvert(): 
        * 
        * @parameters
        *        
        *          · req.body: 
        */

        UserConvert: async function (req, res, next) 
        {
            var final = {};
            final['userid'] = req.self.user;

            for (var key in req.body) 
            {
                if (req.body.hasOwnProperty(key)) 
                { 
                    /* Both, ids and third requests should no go here. */

                    if (key == "id") 
                    {
                        continue;
                    }

                    final[key] = req.body[key];
                }
            }

            req.self.params = final;
            return next();
        },

       /*
        * SmartConvert(): Converts body params to to self.params, while removing
        *                 provided values.
        * 
        * @parameters
        *        
        *          · req.body: Parameters will be passed, excluding those provided in 'words'
        */

        SmartConvert: function (words) 
        {
            return async function (req, res, next) 
            {
                var final = {};

                for (var key in req.body) 
                {
                    if (words.includes(key)) 
                    {
                        continue;
                    }

                    final[key] = req.body[key];
                }

                req.self.params = final;
                return next();
            }
        }
}
