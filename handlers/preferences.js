/*
 * CazuApp - Delivery at convenience.  
 * 
 * Copyright 2023-2024, Carlos Ferry <cferry@cazuapp.dev>
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
     * GetAll(): Retrieves all preferences at once.
     * 
     * @resolve
     * 
     *          · [value]: Preferences.
     */

     GetAll: async function(req)
     {
          return new Promise((resolve, reject) => 
          {
                  return models.preferences.findAll({ where: { userid: req.self.user }, attributes: ['key', 'value']}).then(result => 
                  {
                        return resolve(result);
                  });
          });
     },

    /*
     * Get(): Retrieves a key from the preferences SQL.
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
                 return models.preferences.findOne({ where: { userid: req.self.user, key: req.body.key } }).then(result => 
                 {
                         if (result != null) 
                         {
                               return resolve(result.value);
                         }
                         else
                         {
                               return reject(protocol.not_found);
                         }
                 });
          });
     },

    /*
     * Set(): Defines a preference for a given user.
     * 
     * @parameters
     *        
     *          · key: Key to define a preference with.
     *          · value: Value this key has been assigned.
     * 
     * @resolve
     * 
     *          · protocol.ok: Preference added.
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
                            return models.preferences.findOne({ where: { userid: req.self.user, key: req.body.key }}, { transaction: trans1 }).then(function(result)
                            {
                                    if (result)
                                    {
                                            return models.preferences.update({ value: req.body.value }, { where: { key: req.body.key, userid: req.self.user }}, { transaction: trans1 });
                                    }
                                    else
                                    {
                                            return models.preferences.create({ key: req.body.key, value: req.body.value, userid: req.self.user }, { transaction: trans1 });
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
     * Delete(): Deletes a preference.
     * 
     * @parameters
     *        
     *          · body.key: Preference ID to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Preference removed.
     *
     * @return
     *
     *          · protocol.empty: Preference ID does not exists or is already removed.
     */
    
    Delete: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                 return models.sequelize.transaction(trans1 =>
                 {
                         return models.preferences.destroy({ where: { userid: req.self.user, key: req.body.key }}, { transaction: trans1 }).then(function(result)
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

   /*
     * RemoveAll(): Remove all preferences.
     * 
     * @resolve
     * 
     *          · [value]: Preferences.
     */
    
     Reset: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                return models.preferences.destroy({ where: { userid: req.self.user } }).then(result => 
                {
                       if (result != null)
                       {
                           return resolve(protocol.ok);
                       }

                       return reject([protocol.operation_failed]);
                });
          });
     },
}
