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
var Etc       =  require('../handlers/etc');

module.exports = 
{
    /*
     * GetAll(): Retrieves all public keys at once.
     * 
     * @resolve
     * 
     *          · [value]: Setting's key and value.
     */

     GetAll: async function()
     {
          return new Promise((resolve, reject) => 
          {
                  return models.settings.findAll({ where: { public: true }, attributes: ['key', 'value']}).then(result => 
                  {
                        return resolve(result);
                  });
          });
     },
     
     
     GetSuperAll: async function()
     {
          return new Promise((resolve, reject) => 
          {
                  return models.settings.findAll({attributes: ['key', 'value']}).then(result => 
                  {
                        return resolve(result);
                  });
          });
     },


    /*
     * Get(): Retrieves a key from the setting SQL.
     * 
     * @parameters
     *        
     *          · body.key: Key to retrieve setting with.
     * 
     * @resolve
     * 
     *          · value: Setting's value.
     *
     * @return
     *
     *          · protocol.not_found: Missing key.
     */

     Get: async function(req)
     {
          return new Promise((resolve, reject) => 
          {
                  return models.settings.findOne({ where: { key: req.body.key } }).then(result => 
                  {
                           if (result != null) 
                           {
                                 return resolve(result.is_bool == true ? Etc.as_bool(result.value) : result.value);
                           }
                           else
                           {
                                 return reject([protocol.not_found]);
                           }
                  });
          });
     },
     
    /*
     * Set(): Defines a setting on a key-value format.
     * 
     * @parameters
     *        
     *          · body.key: Key to define a setting with.
     *          · body.value: Value this key has been assigned.
     * 
     * @resolve
     * 
     *          · protocol.ok: Setting added.
     *
     * @return
     *
     *          · missing_param: Missing parameters.
     */

     Set: async function(req)
     {    
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                            
                            return models.settings.findOne({ where: { key: req.body.key }}, { transaction: trans1 }).then(function(result)
                            {
                                    if (result)
                                    {
                                            return models.settings.update({ value: req.body.value, public: req.body.public, is_bool: req.body.bool == null ? result.is_bool : req.body.bool }, { where: { key: req.body.key }}, { transaction: trans1 }).then(function(result2)
                                            {
                                                  return resolve(protocol.ok);
                                            });
                                    }
                                    else
                                    {
                                            return models.settings.create({ key: req.body.key, value: req.body.value, public: req.body.public, is_bool: req.body.bool == null ? false : req.body.bool }, { transaction: trans1 }).then(function(result2)
                                            {
                                                 return resolve(protocol.ok);
                                            });
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

    /*
     * Delete(): Deletes a setting.
     * 
     * @parameters
     *        
     *          · body.key: Setting ID to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Setting removed.
     *
     * @return
     *
     *          · protocol.empty: Setting ID does not exists or is already removed.
     */
    
    Delete: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                    return models.sequelize.transaction(trans1 =>
                    {
                            return models.settings.destroy({ where: { key: req.body.key }}, { transaction: trans1 }).then(function(result)
                            {
                                    if (result && result.length != 0)
                                    {
                                            return resolve(protocol.ok);
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
