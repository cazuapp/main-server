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

module.exports = 
{
    /*
     * FormatValue(): Middleware to format the value in req.body.
     * 
     * @reject
     *
     *        · protocol.missing_value: Missing value in req.body.
     */

    FormatValue: async function (req, res, next) 
    {
        if (!req.body.value) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_value] });
        }

        req.body.value = "%" + req.body.value + "%";
        return next();
    },

    /*
     * NeedsDate(): Middleware to be check if date start and end have been provided.
     * 
     * @reject
     *
     *          · protocol.missing_date: Missing date
     */

    NeedsDate: async function (req, res, next) 
    {
        if (!req.body.date_start && !req.body.date_end) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_date]});
        }
        
        return next();
    },

    /*
     * RequestDelete(): Checks whether user can look for delete items.
     *
     * @return
     *
     *         · self.delete: Delete provided.
     *
     * @reject
     *
     *         · [errors]: Unable to run, no flags.
     */

    RequestDelete: async function (req, res, next) 
    {
        req.self.delete = false;

        if (req.body.delete == null || req.body.delete == false) 
        {
            req.self.delete = false;
            return next();
        }

        /* Calls 'CanManage' middleware */

        return Privs.CanManage(req, res, function () 
        {
            req.self.delete = true;
            return next();
        });

        return next();
    },

    /*
     * ValidNames(): Checks whether both 'first' and 'last' parameters are provided.
     *
     * @return
     *
     *         · no_first: No firstname provided.
     *         · no_last: No lastname provided.
     *
     * @reject
     *
     *         · [errors]: Error list found.
     */

    ValidNames: async function (req, res, next) 
    {
        var errors = [];

        if (!req.body.first) 
        {
            errors.push(protocol.no_first);
        }

        if (!req.body.last) 
        {
            errors.push(protocol.no_last);
        }

        if (errors.length > 0) 
        {
            return res.status(httpr.bad_request).send({codes: errors});
        }

        return next();
    },

    /*
     * NeedsValue(): Middleware to be used when a call requies a value.
     * 
     * @parameters
     *        
     *          · body.value: Value to check.
     * 
     * @reject
     *
     *          · protocol.missing_value: Value not provided.
     */

    NeedsValue: async function (req, res, next) 
    {
        if (req.body.value == null) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_value] });
        }

        return next();
    },
    
    /*
     * NeedsParam(): Middleware to be used when a call requies a param.
     * 
     * @parameters
     *        
     *          · body.param: Param to check.
     * 
     * @reject
     *
     *          · protocol.missing_value: Value not provided.
     */

    NeedsParam: async function (req, res, next) 
    {
        if (req.body.param == null) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.needs_param] });
        }

        return next();
    },


    /*
     * NeedsID(): Middleware to be used when a call requires parameter id.
     * 
     * @parameters
     *        
     *          · body.id: ID to check.
     * 
     * @reject
     *
     *          · protocol.missing_id: ID not provided.
     */

    NeedsID: async function (req, res, next) 
    {
        if (req.body.id == null) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_id] });
        }

        return next();
    },

    /*
     * NeedsKey(): Middleware to be used when defining a key.
     * 
     * @parameters
     *        
     *          · body.key: Key to use.
     * 
     * @reject
     *
     *          · protocol.missing_id: Key not provided.
     */

    NeedsKey: async function (req, res, next) {
        if (! req.body.key) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.missing_key]
            });
        }

        req.body.key = req.body.key.toLowerCase();
        return next();
    },

    /*
     * NeedStatus(): Middleware used when requiring for available body.
     * 
     * @parameters
     *        
     *          · body.available: Status to use.
     * 
     * @reject
     *
     *          · protocol.missing_status: Status to use.
     */

    NeedStatus: async function (req, res, next) 
    {
        if (req.body.available == null) 
        {
            return res.status(httpr.bad_request).send({
                codes: [protocol.missing_status]
            });
        }

        return next();
    },

    /*
     * ValidEmail(): Checks whether an email is valid or not.
     *
     * @return
     *
     *         · missing_email: Email has not been provided.
     *         · bad_format: Email has a bad format.
     */

    ValidEmail: async function (req, res, next) {
        if (! req.body.email) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.missing_email]
            });
        }

        if (! validator.validate(req.body.email)) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.bad_format]
            });
        }

        return next();
    },

    /*
     * ValidPassword(): Checks whether a password has been provided or not.
     *
     * @return
     *
     *         · missing_param: Email has not been provided.
     *         · bad_format: Email has a bad format.
     */

    ValidPassword: async function (req, res, next) 
    {
        if (! req.body.password) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
        }

        if (Etc.HasSpace(req.body.password)) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.pass_has_spaces]
            });
        }

        if (req.body.password.length < 3 || req.body.password.length > 20) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.invalid_length]
            });
        }

        return next();
    },

    /*
     * CheckSamePass(): Checks whether a given password matches.
     *
     * @return
     *
     *        · next(): If password matches.
     *    
     */
    
    CheckSamePass: async function(req, res, next)
    {
             if (req.body.password != req.body.password2)
             {
                    return res.status(httpr.bad_request).send({
                         codes: [protocol.missmatch]
                    });
             }
             
             return next();
    },

    /*
     * ValidPhone(): Checks whether a valid phone has been provided.
     *
     * @return
     *
     *         · missing_param: Phone parameter has not been provided.
     *         · invalid_phone: has a bad format.
     */

    ValidPhone: async function (req, res, next) {
        if (! req.body.phone) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.missing_param]
            });
        }

        if (req.body.phone.length < 3) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.invalid_phone]
            });
        }

        return next();
    },

    /*
     * ValidNewPass(): Checks whether an passwords is valid or not.
     *
     * @return
     *
     *         · invalid_password: Invalid password.
     */

    ValidNewPass: async function (req, res, next) {
        
        if (!req.body.password) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
        }

        
        if (! req.body.password || ! req.body.new) 
        {
            return res.status(httpr.bad_request).send({
                codes: [protocol.invalid_password]
            });
        }

        if (req.body.password == req.body.new) 
        {
            return res.status(httpr.bad_request).send({
                codes: [protocol.same_param]
            });
        }

        if (Etc.HasSpace(req.body.new)) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.pass_has_spaces]
            });
        }

        if (req.body.new.length < 3 || req.body.new.length > 20) {
            return res.status(httpr.bad_request).send({
                codes: [protocol.invalid_length]
            });
        }

        return next();
    },

    /*
     * NeedsProduct(): Checks whether a new favorite has valid body parameters.
     * 
     * @parameters
     *        
     *          · body.[name, address]: Parameters to check.
     * 
     * @resolve
     * 
     *          · next(): Middleware OK, as parameters are provided.
     *
     * @return
     *
     *          · protocol.missing_product: Missing product.
     */

    NeedsProduct: async function (req, res, next) 
    {
        if (!req.body.product) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_product] });
        }

        return next();
    },
    
    /*
     * NeedsVariant(): Checks whether a given variant has been provided
     * 
     * @parameters
     *        
     *          · variant: Variant ID
     * 
     * @resolve
     * 
     *          · next(): Middleware OK, as parameters are provided.
     *
     * @return
     *
     *          · protocol.missing_id: Missing id.
     */
    

    NeedsVariant: async function (req, res, next) 
    {
        if (!req.body.variant) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_variant] });
        }

        return next();
    },

    /*
     * CheckIfDriver(): Checks if an user is a driver or not.
     * 
     * @resolve
     * 
     *          · next(): Middleware OK, user is driver.
     *
     * @return
     *
     *          · protocol.no_driver: User is not a driver.
     */

    CheckIfDriver: async function (req, res, next) 
    {
        if (!req.self.driver) 
        {
            return res.status(httpr.bad_request).send({
                codes: [protocol.no_driver]
            });
        }

        return next();
    },

    /*
     * ProductToID(): Maps the product to its ID.
     * 
     * @resolve
     * 
     *          · next(): Middleware OK, ID mapped.
     *
     * @return
     *
     *          · None
     */
    
    ProductToID: async function (req, res, next) 
    {
        req.body.id = req.body.product;
        return next();
    },

    /*
     * IDToAddress(): Maps the ID to its address.
     * 
     * @resolve
     * 
     *          · next(): Middleware OK, address mapped.
     *
     * @return
     *
     *          · None
     */
     
    IDToAddress: async function (req, res, next) 
    {
        req.body.address = req.body.id;
        return next();
    }

}
