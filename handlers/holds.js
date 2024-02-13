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
     * Get(): Retrieves holds from an user.
     * 
     * @parameters
     *        
     *          · self.user: User to retrieve setting with.
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
                      return models.holds.findOne({ where: { userid: req.self.user } }).then(result => 
                      {
                             if (result != null) 
                             {
                                    return reject({ health: result.health, able_to_order: result.able_to_order });
                             }
                             else
                             {
                                    return resolve([protocol.not_found]);
                             }
                      });
              });
     },

    /*
     * Upsert(): Sets a hold on an user.
     * 
     * @parameters
     *        
     *      · body.id: User to set a hold on.
     * 
     * @resolve
     * 
     *      · protocol.ok Hold added.
     *
     * @reject
     *
     *      · error: Unable to add hold.
     */

     Upsert: async function(req)
     {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                            return models.users.findOne({ where: { id: req.body.id }}, { transaction: trans1 }).then(function(exists)
                            {
                                if (!exists)
                                {
                                     return reject(protocol.no_assoc);
                                }
                                
                                return models.holds.findOne({ where: { userid: req.body.id }}, { transaction: trans1 }).then(function(result)
                                {
                                      if (result)
                                      {
                                            if (req.body.able_to_order == null)
                                            {
                                                req.body.able_to_order = result.able_to_order;
                                            }
                                            
                                            if (req.body.health == null)
                                            {
                                                req.body.health = result.health;
                                            }

                                            if (req.body.able_to_order == true && req.body.health == true)
                                            {
                                                     return models.holds.destroy({ where: { userid: req.body.id } }).then(remove => 
                                                     {
                                                                return resolve(protocol.ok);
                                                     });
                                            }
                                            
                                            return models.holds.update({ able_to_order: req.body.able_to_order, health: req.body.health  }, { where: { userid: req.body.id }}, { transaction: trans1 }).then(function(result2)
                                            {
                                                     return resolve(protocol.ok);
                                            });
                                      }
                                      else
                                      {
                                            return models.holds.create({ able_to_order: req.body.able_to_order, health: req.body.health, userid: req.body.id }, { transaction: trans1 }).then(function(result3)
                                            {
                                                     return resolve(protocol.ok);
                                            });	
                                      }
                                 });
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
     * Delete(): Deletes a hold.
     * 
     * @parameters
     *        
     *          · self.user: Users' hold to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Hold removed.
     *
     * @return
     *
     *          · protocol.empty: Hold ID does not exists or is already removed.
     */
    
    Delete: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                    return models.sequelize.transaction(trans1 =>
                    {
                            /* Removes hold entry from SQL */
                            
                            return models.holds.destroy({ where: { userid: req.self.user }}, { transaction: trans1 }).then(function(result)
                            {
                                    if (result && result.length != 0)
                                    {
                                            return resolve(protocol.ok);
                                    }
                                    else
                                    {
                                            /* No hold found */
                                            
                                            return reject([protocol.no_exists]);
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
