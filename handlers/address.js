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
var httpr      =  require('../run/httpr');
var protocol   =  require('../run/protocol');
var models     =  require('../databases/sql');
var etc        =  require('../handlers/etc');

module.exports =
{
    /*
     * GetDefault(): Retrieves the default address associated with a specified user ID.
     * 
     * @parameters
     *        
     *          · body.[all params]: Address to check.
     * 
     * @return
     *
     *          · 0: No address found.
     *          · > 0: Address' id.
     */

    GetDefault: async function(req, res, next)
    {
          return new Promise((resolve, reject) => 
          {
               return models.address.findOne({ where: { is_default: true, userid: req.self.user, deleted: false }, attributes: ['id'] }).then(result => 
               {
                      if (result == null) 
                      {
                             return models.address.findOne({ where: { userid: req.self.user, deleted: false }, attributes: ['id'] }).then(result2 => 
                             {
                                    if (result2 == null)
                                    {
                                           return resolve({ address_default: 0, origin: false });
                                    }    
                                    else
                                    {
                                           return resolve({ address_default: result2.id, origin: false });
                                    }
                             });     
                      }
                      else
                      {
                             return resolve({ address_default: result.id, origin: true });
                      }
               });
          });
    },	
    
    /*
     * CheckMiddle(): Information as middleware on a default.
     * 
     * @parameters
     *        
     *          · body.[all params]: Address to check.
     * 
     * @reject
     *
     *          · error: Unable to retrieve address.
     */

    CheckMiddle: async function(req, res, next)
    {
            try 
            {
                 var result = await module.exports.GetDefault(req);
                 
                 if (result.address_default == req.body.id)
                 {
                      req.self.this = 1;
                      return next();
                 }
                 
                 req.self.this = 0;
            } 
            catch (error) 
            {
                 req.self.this = 0;
            }
            
            return next();
    },

    /*
     * Info(): Returns information about a given address.
     * 
     * @parameters
     *        
     *          · body.id: Address' ID to retrieve.
     * 
     * @resolve
     * 
     *          · [result]: Address' data.
     *
     * @return
     *
     *          · protocol.empty: Address not found.
     */

     Info: async function(req, res, next)
     {
            return new Promise((resolve, reject) => 
            {
                 return models.address.findOne({ where: { id: req.body.address, deleted: req.self.delete }}).then(result => 
                 {
                       if (result == null) 
                       {
                            return reject([protocol.empty]);
                       }
                       else
                       {
                            return resolve(result);
                       }
                 });
            });
     },

    /*
     * InfoMiddle(): Information as middleware on an address.
     * 
     * @parameters
     *        
     *          · body.[all params]: Address to check.
     * 
     * @reject
     *
     *          · error: Unable to retrieve address.
     */

    InfoMiddle: async function (req, res, next)
    {
            try 
            {
                 req.self.address = await module.exports.Info(req);
                 return next();
            } 
            catch (error) 
            {
                 return res.status(httpr.bad_request).send({ codes: [error] });
            }
    },

    /*
     * ValidAdd(): Checks whether a new address has valid body parameters.
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
     *          · protocol.missing_param: Missing parameters.
     */

    ValidAdd: async function (req, res, next) 
    {
            if (!req.body.name || !req.body.address)
            {
                  return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
            }
            
            if (!req.body.zip)
            {
                 req.body.zip = null;
            }
            
            if (!req.body.options)
            {
                  req.body.options = null;
            }

            if (!req.body.aptsuite)
            {
                  req.body.aptsuite = null;
            }

            if (!req.body.commentary)
            {
                  req.body.commentary = null;
            }

            return next();
    },

    /*
     * Add(): Adds a new address.
     * 
     * @parameters
     *        
     *          · body.[all params]: Address to add.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added address.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add address.
     */

    Add: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                      /* Check whether name exists */
                      
                      return models.address.findOne({ where: { userid: req.self.user, name: req.body.name, deleted: false }}, { transaction: trans1 }).then(init => 
                      {
                            if (init)
                            {
                                 /* Name already in use */
                                 
                                 return reject([protocol.exists]);
                            }
                            
                            return models.address.create(req.self.params, { transaction: trans1 }).then(function(result)
                            {
                                    if (result && result.length != 0)
                                    {
                                            /* Address created: we return new ID */
                                            
                                            return resolve(result.id);
                                    }
                                    else
                                    {
                                            /* Unable to add address */
                                            
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
     * Update(): Updates an address.
     * 
     * @parameters
     *        
     *          · body.[all params]: Address' data to udpate.
     *          · body.id: Address' ID to update.
     * 
     * @resolve
     * 
     *          · protocol.ok: updated.
     *
     * @reject
     *
     *          · protocol.unknown_error: Unable to updated address.
     */
    
    Update: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                      return models.address.update(req.self.params, { where: { userid: req.self.user, id: req.body.id }}, { transaction: trans1 }).then(function(result)
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
     * Delete(): Deletes an address by updating the 'delete' flag.
     * 
     * @parameters
     *        
     *          · body.id: Address ID to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Address removed.
     *
     * @return
     *
     *          · protocol.empty: Address ID does not exists or is alredy removed.
     */

    Delete: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                 return models.sequelize.transaction(trans1 =>
                 {
                        return models.address.findOne({ where: { userid: req.self.user, id: req.body.id, deleted: false }}).then(init => 
                        {
                                 if (!init)
                                 {
                                       return reject([protocol.exists]);
                                 }
                     
                                 return models.address.update({ deleted: true }, { where: { userid: req.self.user, id: req.body.id }}, { transaction: trans1 }).then(function(result)
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
     * IDExists(): Checks whether a given address ID exists.
     * 
     * @parameters
     *        
     *          · body.id: Address to check.
     * 
     * @resolve
     * 
     *          · next(): Address does not exists.
     *
     * @return
     *
     *          · protocol.exists: Address ID already defined.
     */

    IDExists: async function(req, res, next)
    {
          return new Promise((resolve, reject) => 
          {
                    if (!req.body.address)
                    {
                        return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
                    }
                    
                    return models.address.findOne({ where: { id: req.body.address, deleted: req.self.delete }}).then(result => 
                    {
                             if (result != null) 
                             {
                                   req.self.owner = result.userid;
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
     * NameExists(): Checks whether a given address' name exists.
     * 
     * @parameters
     *        
     *          · body.name: Address name to check.
     * 
     * @resolve
     * 
     *          · next(): Name does not exists.
     *
     * @return
     *
     *          · protocol.exists: Address name already defined.
     */

     NameExists: async function(req, res, next)
     {
           return new Promise((resolve, reject) => 
           {
                 return models.address.findOne({ where: { userid: req.self.user, name: req.body.name, deleted: req.body.delete }}).then(result => 
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
     * Get(): Retrieves all addresses within an specific range
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: Address list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

     Get: async function(req)
     {
           return new Promise((resolve, reject) =>
           {
                   return models.address.findAndCountAll({ offset: req.self.offset, limit: req.self.limit, where: { deleted: req.self.delete, userid: req.self.user }}).then(result =>
                   {
                           if (!result || result.length == 0)
                           {
                                  return reject([protocol.empty]);
                           }
                           else
                           { 	
                                  req.self.counter = result["count"];
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
     * CountUser(): Counts an users' addresses.
     *
     * @return
     *
     *         · total: Total users.
     */

    CountUser: async function (req) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.address.count({ where: { deleted: false, userid: req.self.user }}).then(function (result) 
                {
                      req.self.calc.total_address = result;
                      return resolve();
                });
          });
    },
     
    /*
     * HasAnyAddress(): Checks whether a given user has any address at all.
     * 
     * @parameters
     *        
     *          · self.user: User ID.
     * 
     * @resolve
     * 
     *          · next(): User has an address.
     *
     * @return
     *
     *          · protocol.empty: No address found.
     */

    HasAnyAddress: async function (req, res, next) 
    {
             return models.address.count({ where: { deleted: false, userid: req.self.user }}).then(function (result) 
             {
                    if (result == 0)
                    {
                          return res.status(httpr.bad_request).send({ codes: [protocol.empty] });
                    }
                       
                    return next();
             });
    },
    
    /*
     * SetDefault(): Sets a default address on a given user.
     * 
     * @parameters
     *        
     *          ·  body.id: Default address.
     * 
     * @resolve
     * 
     *          · 1: OK
     *
     * @return
     *
     *          · protocol.ok: Default updated.
     */

    SetDefault: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                       return models.address.update({ is_default: false }, { where: { userid: req.self.user }}, { transaction: trans1 }).then(function(result)
                       {
                                if (req.self.this)
                                {
                                     return resolve(1);                                
                                }
                                
                                return models.address.update({ is_default: true }, { where: { userid: req.self.user, id: req.body.address }}, { transaction: trans1 }).then(function(result2)
                                {
                                       return resolve(1);
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
     * IsMine(): Whether a given address is associated to an user.
     * 
     * @parameters
     *        
     *          ·  self.owner: Requesting address.
     *          ·  self.user: Associated user.
     * 
     * @reject
     * 
     *          · protocol.no_assoc: No association.
     */
    
    IsMine: async function(req, res, next)
    {
          return new Promise((resolve, reject) => 
          {
                    if (req.self.user != req.self.owner)
                    {
                              return res.status(httpr.bad_request).send({ codes: [protocol.no_assoc] });
                    }
                    
                    return next();
          });
    },
}
