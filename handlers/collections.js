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
const path     =  require("path");
const fs       =  require("fs");

module.exports = 
{
   /*
    * RemoveImage(): Removes an image associated with a specific ID.
    * 
    * @param {Object} req - The request object containing the ID to remove the image.
    * 
    * @return:
    *        
    *   · ok: if the image is successfully removed or doesn't exist.
    */
 
    RemoveImage: async function (req)
    {
          return new Promise((resolve, reject) => 
          {
               return models.collections.findOne({ where: { id: req.body.id } }).then(result => 
               {
                     try 
                     {
                           var img = path.join( __dirname, "../" + result.imagesrc)
                           fs.unlinkSync(img);
                           return resolve(protocol.ok);
                     }  
                     catch(error) 
                     {
                          /* Given that this function is always called (regardless if an image exists, we always return ok */
                          
                          return resolve(protocol.ok);
                     }
               });    
           });
    },
    
    /*
     * ValidAdd(): Checks whether new collection has valid body parameters.
     * 
     * @parameters
     *        
     *          · body.[title, imagesrc]: Parameters to check
     * 
     * @resolve
     * 
     *          · next(): Parameters provided.
     *
     * @return
     *
     *          · protocol.missing_param: Collection name already defined.
     */

    ValidAdd: async function (req, res, next) 
    {
           if (!req.body.title || req.body.piority == null) 
           {
               return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
           }

           return next();
    },

    /*
     * Add(): Adds a new collection item.
     * 
     * @parameters
     *        
     *          · body.[title, imagesrc]: Parameters to add.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added collection.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add collection.
     */

    Add: async function (req) 
    {
           return new Promise((resolve, reject) => 
           {
                return models.sequelize.transaction(trans1 => 
                {
                    if (!req.body.piority)
                    {
                             req.body.piority = 0;
                    }

                    return models.collections.findOne({ where: { title: req.self.params['title'], deleted: false }}, { transaction: trans1 }).then(result1 => 
                    {
                               if (result1 != null) 
                               {
                                     return reject([protocol.exists]);
                               }
                        
                               return models.collections.create(req.self.params, { transaction: trans1 }).then(function (result) 
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
           });
    },

    /*
     * Delete(): Deletes a collection.
     * 
     * @parameters
     *        
     *          · body.id: Collection ID to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Collection removed.
     *
     * @return
     *
     *          · protocol.empty: Collection ID does not exists or is alredy removed.
     */

    Delete: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                 return models.collections.findOne({ where: { id: req.body.id }}, { transaction: trans1 }).then((init) =>
                 {
                        if (!init)
                        {
                            return reject([protocol.not_found]);
                        }
            
                        return models.products.count({ where: { collection: req.body.id }}, { transaction: trans1 }).then(function (has_products) 
                        {
                                 if (has_products != 0)
                                 { 
                                        return reject([protocol.has_offspring]);
                                 }
                     
                                 return models.collections.update({ deleted: true }, { where: { id: req.body.id }}, { transaction: trans1 }).then(function (result) 
                                 {
                                        if (result && result.length != 0) 
                                        {
                                              return resolve(true);
                                        } 
                                        else 
                                        {
                                              return reject([protocol.empty]);
                                        }
                                 });
                        });
                });
            })
            .then(result =>  
            {
                 return resolve(protocol.ok);
            })
            .catch(error => 
            {
                 Logs.error({ url: req.originalUrl, headers: req.headers, body: req.body, error: error, id: req.body.id }, process.env.ROUTE_STREAM);
                 return reject(error);
            });
        });
    },

    /*
     * NameExists(): Checks whether collection has been previously defined.
     * 
     * @parameters
     *        
     *          · body.title: collection name to check.
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
               return models.collections.findOne({ where: { title: req.body.title, deleted: false }}).then(result => 
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
     * IDExists(): Collection ID exists.
     * 
     * @parameters
     *        
     *          · body.id: Collection's id.
     * 
     * @resolve
     * 
     *          · next(): ID Not present.
     *
     * @return
     *
     *          · protocol.exists: Collection ID exists.
     */

    IDExists: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.collections.findOne({ where: { id: req.body.id, deleted: false }}).then(result => 
            {
                 if (result != null) 
                 {
                      return next();
                 } 
                 else 
                 {
                      return res.status(httpr.bad_request).send({ codes: [protocol.not_found] });
                 }
            });
        });
    },

    /*
     * Info(): Information about a collection.
     * 
     * @parameters
     *        
     *          · body.id: Collection's id.
     * 
     * @resolve
     * 
     *          · protocol.not_found: Collection ID not found.
     *
     * @return
     *
     *          · protocol.exists: Collection ID exists.
     */

    Info: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.collections.findOne({ where: { id: req.body.id, deleted: false }, attributes: ['id','title','imagesrc','piority']}).then(result => 
            {
                 if (result != null) 
                 {
                      return resolve(result);
                 } 
                 else 
                 {
                      return reject([protocol.not_found]);
                 }
            });
        });
    },

    /*
     * Search(): Searches for collections based on the provided search query.
     * 
     * @parameters
     *        
     *          · body.search_query: Search query for collections.title.
     * 
     * @resolve
     * 
     *          · [result]: Matching collections' list.
     *
     * @return
     *
     *          · protocol.empty: No items found.
     */

    Search: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            models.sequelize.query("SELECT * FROM collections WHERE collections.title LIKE :search_query AND deleted = :delete ORDER by collections.piority ASC LIMIT :limit OFFSET :offset", 
            {
                replacements: 
                {
                    limit: req.self.limit, 
                    offset: req.self.offset, 
                    search_query: req.body.value,
                    delete: req.self.delete,
                },

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
                    return resolve(results);
                }
            })
            .catch(error => 
            {
                return reject([protocol.unknown_error]);
            });
        });
    },

    /*
     * List(): Retrieves all collections within an specific range.
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     * 
     * @resolve
     * 
     *          · [result]: Collections' list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

    List: async function (req) 
    {
       return new Promise((resolve, reject) => 
        {
                return models.sequelize.query("SELECT * from collections WHERE deleted = :delete ORDER by collections.piority ASC LIMIT :limit OFFSET :offset",
                {
                      replacements: 
                      { 
                          limit: req.self.limit, 
                          offset: req.self.offset, 
                          delete: req.self.delete 
                      },
                      
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
                          return resolve(results);
                     }
               })
               .catch(function (error) 
               {
                   return reject([protocol.unknown_error]);
               });
          });
    },
    
   /*
    * Update(): Updates a collection.
    * 
    * @parameters
    *        
    *          · self.{all params}: Collection' data to udpate.
    *          · body.id: Collection' ID to update.
    * 
    * @resolve
    * 
    *          · protocol.ok: Added collection.
    *
    * @reject
    *
    *          · protocol.unknown_error: Unable to add collection.
    */

    Update: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                    return models.sequelize.transaction(trans1 =>
                    {
                            if (req.self.params["imagesrc"])
                            {
                                 module.exports.RemoveImage(req);
                            }
                            
                            return models.collections.update(req.self.params, { where: { id: req.body.id }}, { transaction: trans1 }).then(function(result)
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
     * RemoveAll(): Remove all collections.
     *
     * @resolve
     *
     *        · protocol.ok: All collections removed.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to remove collections.
     *
     */

     RemoveAll: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                return models.collections.destroy({ where: { }, truncate: true }).then(result => 
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
     * GetProducts(): Retrieves all products from a collection.
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     *          · body.id: Collection ID.
     * 
     * @resolve
     * 
     *          · [result]: Product list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */
     
     GetProducts: async function (req)
     {
          return new Promise((resolve, reject) => 
          {
              return models.sequelize.query("SELECT p.id, p.name, p.description, p.collection, (SELECT price FROM variants WHERE product = p.id ORDER BY id LIMIT 1) AS price, (SELECT image FROM variant_images WHERE variant = (SELECT id FROM variants WHERE product = p.id ORDER BY id LIMIT 1) ORDER BY id LIMIT 1) AS image FROM products p WHERE p.collection = :id AND p.deleted = false LIMIT :limit OFFSET :offset;",
              {
                    replacements: { id: req.body.id, limit: req.self.limit, offset: req.self.offset },
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
                         return resolve(results);
                  }
              })
              .catch(function (error) 
              {
                   return reject([protocol.unknown_error]);
              });
          });     
    },
    
    /*
     * SearchProducts(): Search all products from a collection.
     * 
     * @parameters
     *        
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     *          · body.id: Collection ID.
     * 
     * @resolve
     * 
     *          · [result]: Product list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */
     
     SearchProducts: async function (req)
     {
          return new Promise((resolve, reject) => 
          {
              return models.sequelize.query("SELECT p.id, p.name, p.description, p.collection, (SELECT price FROM variants WHERE product = p.id ORDER BY id LIMIT 1) AS price, (SELECT image FROM variant_images WHERE variant = (SELECT id FROM variants WHERE product = p.id ORDER BY id LIMIT 1) ORDER BY id LIMIT 1) AS image FROM products p WHERE p.collection = :id AND p.deleted = false AND p.name LIKE :search LIMIT :limit OFFSET :offset;",
              {
                    replacements: { search: req.body.value, id: req.body.id, limit: req.self.limit, offset: req.self.offset },
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
                         return resolve(results);
                  }
              })
              .catch(function (error) 
              {
                   return reject([protocol.unknown_error]);
              });
          });     
    },
    
}