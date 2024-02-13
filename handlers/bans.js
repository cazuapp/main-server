/*
 * CazuApp - Delivery at convenience.  
 * 
 * Copyright 2023 -2024, Carlos Ferry <cferry@cazuapp.dev>
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
var protocol  =  require('../run/protocol');
var models    =  require('../databases/sql');
var Cache     =  require('../run/cache');

module.exports = 
{
    /*
     * Update(): Updates a ban's code.
     * 
     * @parameters
     *        
     *          · body.id: User's ID whose ban belongs to.
     * 
     * @resolve
     * 
     *          · protocol.ok: updated.
     *
     * @reject
     *
     *          · protocol.error: Error occured, and this requet was not able to update ban.
     */
    
    Update: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                       /* Update ban code */
                       
                       return models.bans.update(req.self.params, { where: { userid: req.body.id }}, { transaction: trans1 }).then(function(result)
                       {
                                if (result && result.length != 0)
                                {
                                       return resolve(true);
                                }
                                else
                                {
                                       return reject([protocol.error]);
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
     * GetAll(): Retrieves all bans within an specific range.
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: bans list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

     Get: async function(req)
     {
           return new Promise((resolve, reject) =>
           {
                   return models.bans.findAndCountAll({ offset: req.self.offset, limit: req.self.limit }).then(result =>
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
     * GetWhere(): Retrieves all bans within an specific range, given an specific code.
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range.
     * 
     * @resolve
     * 
     *          · [result]: bans list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

     GetWhere: async function(req)
     {
           return new Promise((resolve, reject) =>
           {
                   return models.bans.findAndCountAll({ offset: req.self.offset, limit: req.self.limit }, { where: { code: req.body.id } }).then(result =>
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
     * Info(): Information on an user's ban
     *
     * @resolve
     *
     *         · next():
     *
     * @resolve
     *
     *         · protocol.not_found: Ban ID not found.
     */

    Info: async function (req) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.users.findOne({ where: { id: req.body.id }}).then(init => 
                {
                     if (!init)
                     {
                          return reject([protocol.not_found]);
                     }
                
                     return models.bans.findOne({ where: { userid: req.body.id }}).then(result => 
                     { 
                          if (!result)
                          {
                              return reject([protocol.no_assoc]);
                          }
                         
                          return resolve({ban: result, user: init} );
                     });
                });
          });
    },

    /*
     * RemoveAll(): Remove all bans.
     *
     * @resolve
     *
     *        · protocol.ok: All bans removed.
     *
     * @reject
     *
     *        · protocol.operation_failed: Unable to remove all bans.
     *
     */

    RemoveAll: async function (req, res, next) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.bans.destroy({ where: { }, truncate: true }).then(result => 
                {
                      if (result != null)
                      {
                             return resolve(protocol.ok);
                      }

                      return reject([protocol.operation_failed]);
                });
          });
    },

    /*
     * IsBanned(): Checks whether an user is banned or not.
     *
     * @resolve
     *
     *         · [array]: Login parameters.
     *
     * @resolve
     *
     *         · protocol.unable_to_log_in: Unable to log in.
     */

    IsBanned: async function (req, res, next) 
    {
          return models.bans.findOne({ where: { userid: req.self.user }}).then(result => 
          {
                 if (result != null) 
                 {
                      return res.status(httpr.banned).send({ codes: [protocol.banned], status: result.code });
                 } 
                 else
                 {
                      return next();
                 }
          });
    },

    /*
     * IDBanned(): Checks whether a given body is banned or not.
     *
     * @resolve
     *
     *         · next(): User not banned.
     *
     * @resolve
     *
     *         · protocol.banned: Banned is indeed prohibited from logging in.
     */

    IDBanned: async function (req, res, next) 
    {
          return models.bans.findOne({ where: { userid: req.body.id }}).then(result => 
          {
                 if (result != null) 
                 {
                      return res.status(httpr.bad_request).send({ codes: [protocol.exists] });
                 } 
                 else
                 {
                      return next();
                 }
          });
    },

    /*
     * Upsert(): Adds or updates a new ban.
     * 
     * @parameters
     *        
     *          · body.id: User's id to manage ban.
     *          · body.code: Code to define.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added or modified ban.
     *
     * @reject
     *
     *          · protocol.empty: Unable to upsert ban.
     */

    Upsert: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                if (req.body.id == req.self.user)
                {
                      return reject([protocol.missmatch]);
                }
                
                return models.sequelize.transaction(trans1 =>
                {
                      return models.bans.findOne({ where: { userid: req.body.id }}, { transaction: trans1 }).then(function(init)
                      {
                              if (init)
                              {
                                      /* If req.body.code is not defined, we use current one */
                                          
                                      return models.bans.update({ code: !req.body.code ? init.code : req.body.code }, { where: { userid: req.body.id }}, { transaction: trans1 }).then(function(result)
                                      {
                                              if (result && result.length != 0)
                                              {
                                                     return resolve(protocol.ok);
                                              }
                                              else
                                              {
                                                     return reject([protocol.error]);
                                              }
                                      });                                      
                              }
                                  
                              /* Defaulting to code 1 when adding a new ban */
                                  
                              if (!req.body.code)
                              {
                                    req.body.code = 1;
                              }

                              return models.bans.create({ code: req.body.code, userid: req.body.id }, { transaction: trans1 }).then(function(result)
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
     * Delete(): Deletes a ban by removing it from the system.
     * 
     * @parameters
     *        
     *          · body.id: Users' ID to remove from the ban table.
     * 
     * @resolve
     * 
     *          · protocol.ok: Ban removed.
     *
     * @return
     *
     *          · protocol.empty: Users' ban does not exists; ban never existed or it has been already removed.
     */

    Delete: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                    return models.sequelize.transaction(trans1 =>
                    {
                            /* Remove ban from Bans table */
                            
                            return models.bans.destroy({ where: { userid: req.body.id }}, { transaction: trans1 }).then(function(result)
                            {
                                    if (result && result.length != 0)
                                    {
                                            return 1;
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
     * CountAll(): Counts all bans' within your system.
     *
     * @return
     *
     *         · total: Total bans.
     */

    CountAll: async function () 
    {
          return new Promise((resolve, reject) => 
          {
                return models.bans.count().then(function (result) 
                { 
                      return resolve(result);
                });
          });
    },

    /*
     * CountWhere(): Counts all bans' using certain parameters within your system.
     *
     * @return
     *
     *         · total: Total bans.
     */

    CountWhere: async function (req) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.bans.count(req.self.params).then(function (result) 
                {
                      return resolve({ where: result });
                });
          });
    },
    
    /*
     * List(): Retrieve all bans.
     *
     * @resolve
     *
     *        · [results]: All bans found.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to fetch bans.
     *
     */

     List: async function (req, res, next) 
     {
           return new Promise((resolve, reject) => 
           {
                   return models.sequelize.query("SELECT bans.*, user_info.first, user_info.last, users.email FROM bans JOIN users ON bans.userid = users.id JOIN user_info ON bans.userid = user_info.userid LIMIT :limit OFFSET :offset",
                   {
                        replacements: 
                        {    
                             limit: req.self.limit,
                             offset: req.self.offset,
                         },
                      
                         type: models.sequelize.QueryTypes.SELECT,
                   })
                   .then((results) => 
                   {
                         if (!results || results.length == 0) 
                         {
                              return reject([protocol.empty]);
                         }

                         return resolve(results);
                   })
                   .catch(function (error) 
                   {
                          return reject(error);
                   });
           });
    },

    /*
     * Search(): Searches for a ban.
     *
     * @resolve
     *
     *        · [results]: All bans found.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to fetch bans.
     *
     */

     Search: async function (req, res, next) 
     {
           return new Promise((resolve, reject) => 
           {
                   return models.sequelize.query("SELECT bans.*, user_info.first, user_info.last, users.email FROM bans JOIN users ON bans.userid = users.id JOIN user_info ON bans.userid = user_info.userid AND (user_info.first like :query OR user_info.last like :query) LIMIT :limit OFFSET :offset",
                   {
                        replacements: 
                        {    
                             query: req.body.value,
                             limit: req.self.limit,
                             offset: req.self.offset,
                         },
                         
                         type: models.sequelize.QueryTypes.SELECT,
                   })
                   .then((results) => 
                   {
                         if (!results || results.length == 0) 
                         {
                              return reject([protocol.empty]);
                         }

                         return resolve(results);
                   })
                   .catch(function (error) 
                   {
                          return reject(error);
                   });
           });
    },
}
