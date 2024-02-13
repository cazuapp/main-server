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
     * Add(): Adds a new alt payment.
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
                            if (!req.body.global)
                            {
                                   req.body.global = false;
                            }
                            
                            return models.payment_types.create({ global: req.body.global, name: req.body.name }, { transaction: trans1 }).then(function(result)
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

    IDExists: async function(req, res, next)
    {
          return new Promise((resolve, reject) => 
          {
                    if (!req.body.payment)
                    {
                        return res.status(httpr.bad_request).send({ codes: [protocol.missing_value] });
                    }
                    
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
}
