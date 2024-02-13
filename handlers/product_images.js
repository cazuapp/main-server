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

module.exports = 
{
    /*
     * ValidAdd(): Checks whether new orders has valid body parameters.
     * 
     * @parameters
     *        
     *          · body.[name, collection, price]: Parameters to check
     * 
     * @resolve
     * 
     *          · next(): Parameters provided.
     *
     * @return
     *
     *          · protocol.missing_param: Missing parameters.
     */

    ValidAdd: async function (req, res, next) 
    {
          if (!req.body.name || !req.body.collection || !req.body.price || !req.body.title) 
          {
              return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
          }

          if (!req.body.options) 
          { 
              req.body.options = null;
          }

          if (!req.body.aptsuite) 
          {
              req.body.aptsuite = null;
          }
        
          return next();
    },

    /*
     * Add(): Adds a new product.
     * 
     * @parameters
     *        
     *          · body.[name, collection, stock, title]: Parameters to utilize on this new product.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added collection.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add product.
     */

    Add: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                 return models.products.create(req.self.params, { transaction: trans1 }).then(function (result) 
                 {
                      if (result && result.length != 0) 
                      {
                           return resolve({ id: result.id });
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
            .catch(error => 
            {
                  return reject(error);
            });
        });
    },

    /*
     * Delete(): Deletes a product.
     * 
     * @parameters
     *        
     *          · body.id: Product ID to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Product removed.
     *
     * @return
     *
     *          · protocol.empty: Product ID does not exists or is alredy removed.
     */

    Delete: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.sequelize.transaction(trans1 => 
             {
                  return models.products.update({ deleted: true }, { where: { id: req.body.id }}, { transaction: trans1 }).then(function (result) 
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
             .catch(error => 
             {
                  return reject(error);
             });
        });
    },

    /*
     * NameExists(): Checks whether product has been previously defined.
     * 
     * @parameters
     *        
     *          · body.name: Product name to check.
     * 
     * @resolve
     * 
     *          · next(): Name does not exists.
     *
     * @return
     *
     *          · protocol.exists: Product name already defined.
     */

    NameExists: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.products.findOne({ where: { name: req.body.name, deleted: false }}).then(result => 
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
     * Info(): Returns information about a given product.
     * 
     * @parameters
     *        
     *          · body.id: Product' ID to retrieve.
     * 
     * @resolve
     * 
     *          · next(): Product' data.
     *
     * @reject
     *
     *          · protocol.empty: Product not found.
     */

    Info: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             if (!req.body.deleted)
             {
                    req.body.deleted = false;
             }

             return models.products.findOne({ where: { id: req.body.id, deleted: req.body.deleted }}).then(result => 
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
     * IDExists(): Checks whether a given product exists.
     * 
     * @parameters
     *        
     *          · body.id: Product ID to retrieve.
     * 
     * @resolve
     * 
     *          · next(): Product does not exists.
     *
     * @reject
     *
     *          · protocol.exists. Product already within the server.
     */

    IDExists: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.products.findOne({ where: { id: req.body.id, deleted: false }}).then(result => 
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
     * AllExists(): Checks whether given products actually exist.
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @next
     * 
     *          · OK. All items are in stock.
     *
     * @return
     *
     *          · protocol.no_exists: Product does no exists.
     *          · missing: Array of missing items.
     */

    AllExists: async function (req, res, next) 
    {
        var MyItems        =  req.body.items;
        var missing        =  [];
        req.self.total     =  0;
        req.self.total_tax =  0;

        for (const key of MyItems) 
        {
            var result = await models.products.findOne({ where: { id: key.product, deleted: false }});

            if (result == null) 
            {
                missing.push(key.product);
            } 
            else 
            { 
                /* Check if product has no stock */

                if (result.stock != -1) 
                {
                       if (result.stock == 0 || result.stock < key.stock)
                       {	
                                /* Product has no stock */
                                                    
                                missing.push(key.product);
                        }
                }
                                         
                req.self.total = req.self.total + (result.price * key.quantity);
            }
        }

        if (missing.length == 0)
        {
              return next();
        }
        
        req.self.total = 0;
        return res.status(httpr.bad_request).send({ codes: [protocol.no_exists], missing: missing });
    },
    
    /*
     * Get(): Retrieves all products within an specific range
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: Product list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

     Get: async function (req) 
     {
           return new Promise((resolve, reject) => 
           {
                  return models.products.findAll({ offset: req.self.offset, limit: req.self.limit}, { where: { deleted: false, collection: req.body.id }}).then(result => 
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
           }) 
     },

   /*
    * Update(): Updates a product.
    * 
    * @parameters
    *        
    *          · body.[all params]: Product' data to udpate.
    *          · body.id: Product' ID to update.
    * 
    * @resolve
    * 
    *          · protocol.ok: Added product.
    *
    * @reject
    *
    *          · protocol.unknown_error: Unable to add product.
    */

    Update: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                   return models.sequelize.transaction(trans1 =>
                   {
                         return models.products.update(req.self.params, { where: { id: req.body.id }}, { transaction: trans1 }).then(function(result)
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
     * RemoveAll(): Remove all products.
     *
     * @resolve
     *
     *        · protocol.ok: All products removed.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to remove products.
     *
     */

     RemoveAll: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                return models.options.destroy({ where: { }, truncate: true }).then(first =>
                {
                      return models.products.destroy({ where: { }, truncate: true }).then(result => 
                      {
                             if (result != null)
                             {
                                  return resolve(protocol.ok);
                             }

                              return reject([protocol.operation_failed]);
                      });
               });
          });
     },
    
    /* 
     * CountProducts(): Counts products.
     * 
     * @parameters
     *        
     *          · body.id: 
     * 
     * @resolve
     * 
     *          · orders: Orders' data.
     *
     * @return
     *
     *          · protocol.no_exists: User ID empty.
     */
    
    CountProducts: async function(req, res, next)
    {
           return new Promise((resolve, reject) => 
           {
                   return models.products.count({ where: { deleted: false }}).then(result => 
                   {
                             if (result != null) 
                             { 
                                   return resolve({ count_products: result });
                             } 
                             else 
                             {
                                   return reject([protocol.no_exists]);
                             }
                   });
           });
    },
    
    /*
     * CountWhere(): Counts all products' using certain parameters within your system.
     *
     * @return
     *
     *         · total: Total products.
     */

    CountWhere: async function (req) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.products.count(req.self.params).then(function (result) 
                {
                    return resolve({ where: result });
                });
          });
    },
    
    
}
