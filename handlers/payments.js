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
     * GetAll(): Retrieves all payments within an specific range
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: Payment list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

     GetAll: async function(req)
     {
           return new Promise((resolve, reject) =>
           {
                   return models.payment_types.findAndCountAll({}).then(result =>
                   {
                           if (!result || result.length == 0)
                           {
                                  return reject([protocol.empty]);
                           }
                           else
                           {
                                  return resolve(result);
                           }
                   })
                   .catch(function (error) 
                   {
                           return reject(error);
                   });
           });
     },

    /*
     * IDExists(): Checks whether a given payment ID exists.
     * 
     * @parameters
     *        
     *          · body.id: Payment to check.
     * 
     * @resolve
     * 
     *         · next(): Next payment.
     *
     * @return
     *
     *          · protocol.exists: Payment ID already defined.
     */

    IDExists: async function(req, res, next)
    {
          return new Promise((resolve, reject) => 
          {
                    return models.payment_types.findOne({ where: { id: req.body.payment }}).then(result => 
                    {
                             if (result != null) 
                             {
                                   return next();
                             }
                             else
                             {
                                   return res.status(httpr.bad_request).send({ codes: [protocol.exists] });
                             }
                    });
          });
    },

     /* NameExists(): Checks whether a given payment' name exists.
     * 
     * @parameters
     *        
     *          · body.name: Payment name to check.
     * 
     * @resolve
     * 
     *          · next(): Name does not exists.
     *
     * @return
     *
     *          · protocol.exists: Payment name already defined.
     */

     NameExists: async function(req, res, next)
     {
           return new Promise((resolve, reject) => 
           {
                   return models.payment_types.findOne({ where: { name: req.body.name }}).then(result => 
                   {
                             if (result == null) 
                             {
                                    return next();
                             }
                             else
                             {
                                    return res.status(httpr.bad_request).send({ codes: [protocol.exists] });
                             }
                   });
           });
     },
    
    /*
     * Add(): Adds a new payment.
     * 
     * @parameters
     *        
     *          · body.[all params]: Payment to add.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added payment.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add payment.
     */

    Add: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                       /* 
                        * Global basically means that anyone can access this payment without a need for
                        * inserting on a given users' table. 
                        */
                             
                        if (!req.body.global)
                        {
                             req.body.global = true;
                        }
                            
                        return models.payment_types.create({ icon: req.body.icon, name: req.body.name, global: req.body.global }, { transaction: trans1 }).then(function(result)
                        {
                               if (result && result.length != 0)
                               {
                                            return resolve(result.id);
                               }
                               else
                               {
                                            return reject([protocol.empty]);
                               }
                        });
                })
                .then(result => 
                {
                        return resolve(protocol.ok);
                })
                .catch (error => 
                {
                        return reject(error);
                });
          });
    },
}
