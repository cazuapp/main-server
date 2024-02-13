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

var Promise      =  require('promise');
var httpr        =  require('../run/httpr');
var protocol     =  require('../run/protocol');
var models       =  require('../databases/sql');
var variants     =  require('../handlers/variants');

module.exports =
{
    /*
     * CountWhere(): Counts all drivers' within your system.
     *
     * @return
     *
     *         · total: Total collections.
     */

    GroupWhere: async function (req) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.favorites.count({ group: ['product'], attributes: ['product'] }).then(function (result) 
                { 
                     return resolve( result );
                });
          });
    },

    /*
     * Add(): Adds a new favorite by associating a userid with a product id.
     * 
     * @parameters
     *        
     *          · body.{params}: Favorite to add.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added favorite.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add favorite.
     */

    Add: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                       return models.favorites.create({ userid: req.self.user, product: req.body.id }, { transaction: trans1 }).then(function(result)
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

    /*
     * Delete(): Deletes an address by updating the 'delete' bool.
     * 
     * @parameters
     *        
     *          · body.id: Favorite ID to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Favorite removed.
     *
     * @return
     *
     *          · protocol.empty: Favorite ID does not exists or is alredy removed.
     */

    Delete: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                      return models.favorites.destroy({ where: { userid: req.self.user, product: req.body.id }}, { transaction: trans1 }).then(function(result)
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
     * IDExists(): Checks whether a given product ID is ever defined.
     * 
     * @parameters
     *        
     *          · body.id: Product ID to check.
     * 
     * @resolve
     * 
     *          · next(): Product ID does exists.
     */

    IDExists: async function(req, res, next)
    {
          return new Promise((resolve, reject) => 
          {
                 return models.favorites.findOne({ where: { product: req.body.id }}).then(result => 
                 {
                         if (result != null) 
                         {
                               return next();
                         }
                         else
                         {
                              return res.status(httpr.bad_request).send({ codes: [protocol.empty] });
                         }
                 });
          });
    },
    
    /*
     * Check(): Checks whether a given product is associated with an user.
     * 
     * @parameters
     *        
     *          · body.id: Product to check.
     * 
     * @resolve
     * 
     *          · reject(): Favorite does not exists.
     *
     * @return
     *
     *          · resolve: Product ID exists.
     */

    Check: async function(req)
    {
          return new Promise((resolve, reject) => 
          {
                 return models.favorites.findOne({ where: { product: req.body.id, userid: req.self.user }}).then(result => 
                 {
                        if (result != null) 
                        {
                             return resolve()
                        }
                        else
                        {
                             return reject();
                        }
                 });
          });
    },

    /*
     * CheckMiddle(): Runs Check() function and returns it as a middleware
     * 
     * @parameters
     *        
     *          · body.{all params}: Product ID to check
     * 
     * @reject
     *
     *          · error: Unable to retrieve favorite.
     */
    
    CheckMiddle: async function(req, res, next)
    {
            try 
            {
                await module.exports.Check(req);
                req.self.favorite   =  true;
            } 
            catch (error) 
            {
               req.self.favorite    = false;
            }
            
            return next();
    },

    /*
     * Smart(): Smarts adds and delete a boolean associated with a favorite an user.
     * 
     * @parameters
     *        
     *          · body.value: Value to set favorite to.
     * 
     * @reject
     *
     *          · error: Unable to retrieve favorite.
     */
    
    Smart: async function(req)
    {
           return new Promise((resolve, reject) =>
           {
                     if (req.self.favorite == true && req.body.value == false)
                     {
                             try 
                             {
                                  module.exports.Delete(req);
                                  return resolve(protocol.ok);
                              }
                              catch(error)
                              {
                                     return reject([protocol.empty]);
                              }
                     }
                     
                     if (req.self.favorite == false && req.body.value == true)
                     {
                             try 
                             {
                                     module.exports.Add(req);
                                     return resolve(protocol.ok);
                              }
                              catch(error)
                              {
                                     return reject([protocol.empty]);
                              }
                     }
                     
                     return reject([protocol.unknown_error]);                
           });
    },

    /*
     * Get(): Retrieves all favorites within an specific range
     * 
     * @parameters
     *        
     *          · self.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: Favorite list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

     Get: async function(req)
     {
           return new Promise((resolve, reject) =>
           {
                   return models.favorites.findAndCountAll({ offset: req.self.offset, limit: req.self.limit, where: {  userid: req.self.user }}).then(result =>
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
     * GetJoin(): Retrieves all favorites within an specific range
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: Favorite list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */
     
     GetJoin: async function (req)
     {
          return new Promise((resolve, reject) => 
          {
              return models.sequelize.query("SELECT favorites.product as id, products.name as name, products.description as description, products.collection as collection from favorites INNER JOIN products ON products.id = favorites.product where (products.deleted = false AND favorites.userid = :user) LIMIT :limit OFFSET :offset",
              {
                    replacements: { user: req.self.user, limit: req.self.limit, offset: req.self.offset },
                    type: models.sequelize.QueryTypes.SELECT,
              })
              .then(results => 
              {
                  if (!results || results.length == 0)  
                  {
                         return reject([protocol.empty]);
                  } 
                  else 
                  {
                         var all = [];
                         var counter = 0;
                         
                         return results.forEach(async (item) =>
                         {       
                                 let imgrslt = null;
                                     
                                 await models.variants.findOne({ where: { product: item.id }}).then(async idmg => 
                                 {
                                        item.price = idmg.price;
                                        
                                        await models.variant_images.findOne({ where: { variant: idmg.id }}).then(img =>
                                        {
                                              if (img != null)
                                              {
                                                   imgrslt = img.image
                                              }
                                        });
                                 })
                                     
                                 if (imgrslt == null)
                                 {
                                     item.image = null;
                                 }
                                 else
                                 {
                                     item.image = imgrslt;
                                 }
                                 
                                 counter++;
                                 
                                 all.push(item);
                                 
                                 if (counter == results.length)
                                 {
                                     return resolve(all);
                                 }
                         });

                         return reject([protocol.empty]);

                  }
              })
              .catch(function (error) 
              {
                   return reject([protocol.unknown_error]);
              });
          });
     },

    /*
     * CountGetJoin(): Counts all items on a given range.
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: Favorite counter.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

     CountGetJoin: async function (req, res, next)
     {
              return models.sequelize.query("SELECT count(*) as counter from favorites INNER JOIN products ON products.id = favorites.product where (products.deleted = false AND favorites.userid = :user)",
              {
                    replacements: { user: req.self.user },
                    type: models.sequelize.QueryTypes.SELECT,
              })
              .then(results => 
              {
                    if (!results) 
                    {
                        req.self.results = 0;
                        return res.status(httpr.bad_request).send({ codes: [protocol.empty] });
                    } 
                    else 
                    {
                        req.self.results = results[0]["counter"];
                    }
                  
                    return next();
              })
              .catch(function (error) 
              {
                    req.self.results = 0;
                    return next();
              });
     },
     
    /* 
     * RemoveAll(): Remove all favorites.
     *
     * @resolve
     *
     *        · protocol.ok: All favorites removed.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to remove favorites.
     *
     */

     RemoveAll: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                return models.favorites.destroy({ where: { }, truncate: true }).then(result => 
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
     * RemoveAll(): Remove all favorites on a given user.
     *
     * @resolve
     *
     *        · protocol.ok: All favorites removed.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to remove favorites.
     *
     */

     RemoveUser: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                return models.favorites.destroy({ where: { userid: req.self.user }, truncate: true }).then(result => 
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
     * CountUser(): Count total of favorites on a given user.
     *
     * @resolve
     *
     *        · protocol.ok: 
     *
     * @reject
     *
     *        · protocol.operation_failed: 
     *
     */
     
    CountUser: async function (req) 
    {
          return new Promise((resolve, reject) => 
          {
                 return models.favorites.count({ where: { userid: req.self.user }}).then(result => 
                 {
                       if (!result || result.length == 0) 
                       {
                            req.self.calc.total_favorites = 0;
                            return resolve();
                       } 
                       
                       req.self.calc.total_favorites = result;
                       return resolve();

                 })
                 .catch(function (error) 
                 {
                      req.self.calc.total_favorites = 0;
                      return resolve();
                 });
          });
    },
}
