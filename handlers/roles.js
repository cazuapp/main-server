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
     * CheckIfRoot(): Checks whether an user has certain root flags.
     * 
     * @parameters
     *        
     *          · body.id: Updating user.
     *          · body.[flags]: Flags to associate an user with.
     * 
     * @resolve
     * 
     *          · value: Setting's value.
     */

    CheckIfRoot: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                /* If app is not installed, any user can add a role */
                
                if (req.app.get('installed') != 1)
                {
                        return next();
                }
                
                return models.sequelize.transaction(trans1 =>
                {
                        return models.users.findOne({ where: { id: req.body.id }, transaction: trans1 }).then(function(exists)
                        {
                                if (!exists)
                                {
                                     return reject(protocol.no_assoc);
                                }

                                return models.user_roles.findOne({ where: { userid: req.body.id }, transaction: trans1 }).then(function(result)
                                {  
                                        if (result != null)
                                        {
                                                if (result.can_root)
                                                {
                                                        return next();
                                                }
                                        }
                                });
                        });
                });
         });    
    },
    
    /*
     * Upsert(): Defines a key to a role.
     * 
     * @parameters
     *        
     *          · body.id: Updating user.
     *          · body.[flags]: Flags to associate an user with.
     * 
     * @resolve
     * 
     *          · value: Setting's value.
     */

     Upsert: async function(req)
     {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                        return models.users.findOne({ where: { id: req.body.id }, transaction: trans1 }).then(function(exists)
                        {
                                if (!exists)
                                {
                                     return reject(protocol.no_assoc);
                                }

                                return models.user_roles.findOne({ where: { userid: req.body.id }, transaction: trans1 }).then(function(result)
                                {  
                                      if (result != null)
                                      {
                                                if (req.body.can_manage == null)
                                                {
                                                      req.body.can_manage = result.can_manage;
                                                }
                                                
                                                if (req.body.root_flags == null)
                                                {
                                                      req.body.root_flags = result.root_flags;
                                                }
                                                
                                                if (req.body.can_assign == null)
                                                {
                                                     req.body.can_assign = result.can_assign;
                                                }
                                                 
                                                if (req.body.can_assign == false && req.body.can_manage == false && req.body.root_flags == false)
                                                {
                                                     return models.user_roles.destroy({ where: { userid: req.body.id } }).then(remove => 
                                                     {
                                                                return resolve(protocol.ok);
                                                     });
                                                }
                                                 
                                                return models.user_roles.update({ can_manage: req.body.can_manage, root_flags: req.body.root_flags, can_assign: req.body.can_assign }, { where: { userid: req.body.id }}, { transaction: trans1 }).then(function(result2)
                                                {
                                                       return resolve(protocol.ok);
                                                });
                                      }
                                      else
                                      {         
                                                if (req.body.can_manage == null)
                                                {
                                                      req.body.can_manage = false;
                                                }

                                                if (req.body.root_flags == null)
                                                {
                                                      req.body.root_flags = false;
                                                }
                                                
                                                if (req.body.can_assign == null)
                                                {
                                                     req.body.can_assign = false;
                                                }
                                               
                                               return models.user_roles.create({ can_manage: req.body.can_manage, root_flags: req.body.root_flags, can_assign: req.body.can_assign, userid: req.body.id }, { transaction: trans1 }).then(function(result3)
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
                  return models.user_roles.findOne({ where: { userid: req.body.id } }).then(result => 
                  {
                           if (result != null) 
                           {
                                 return resolve(result);
                           }
                           else
                           {
                                 return reject(protocol.not_found);
                           }
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
                         return models.user_roles.destroy({ where: { userid: req.body.id }}, { transaction: trans1 }).then(function(result)
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
