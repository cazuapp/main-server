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
     * ValidAdd(): Checks whether a new variant have valid body parameters.
     * 
     * @parameters
     *        
     *          · body.[]: Parameters to check
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
           if (!req.body.product || !req.body.price) 
           {
               return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
           }
           
           /* A price cannot be 0 */
           
           if (req.body.price == 0 || req.body.price == 0.0)
           {
               return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
           }
          
           req.body.id = req.body.product;
           return next();
    },

    /*
     * Add(): Adds a new variant.
     * 
     * @parameters
     *        
     *          · body.[all params]: Variant to add.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added variant.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add variant.
     */

    Add: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                 return models.variants.create(req.self.params, { transaction: trans1 }).then(function (result) 
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

    MiddleImages: async function(req, res, next)
    {
            try 
            {
                var result = await module.exports.Images(req);
                req.self.images   =  result;
            } 
            catch (error) 
            {
               req.self.images  = [];
            }

            return next();
    },

    /*
     * Info(): Returns information about a variant.
     * 
     * @parameters
     *        
     *          · body.[all params]: Variant to retrieve info from..
     * 
     * @return
     *
     *          · [data]: Information about variant.
     */

    Info: async function(req, res, next)
    {
        return new Promise((resolve, reject) => 
        {	
             return models.sequelize.query("SELECT variants.id AS variant_id, variants.createdat as created, variants.price, variants.title as variant_title, variants.stock, products.id AS product_id, products.name AS product_name, (SELECT image FROM variant_images WHERE variant_images.variant = variants.id ORDER BY variant_images.rank DESC LIMIT 1) AS first_image, collections.id AS collection_id, collections.title AS collection_title FROM variants INNER JOIN products ON variants.product = products.id INNER JOIN collections ON products.collection = collections.id WHERE variants.id = :id;",
             {
                     replacements: 
                     {
                        id: req.body.id,
                     },
                     
                     type: models.sequelize.QueryTypes.SELECT,
             })
             .then((results) => 
             {
                if (!results || results.length === 0) 
                {
                    return reject([protocol.empty]);
                }

                return resolve(results[0]);
             })
             .catch((error) => 
             {
                  return reject(error);
              });
        });
    },  

    QuickImages: async function (id)
    {
          return new Promise((resolve, reject) => 
          {
               return models.variant_images.findOne({ where: { variant: id }}).then(result =>
               {
                      if (result != null)
                      {
                             return resolve(result.image);
                      }
                      
                      return reject([protocol.empty]);
                });
          });
    },
    
    Images: async function (req) 
    {
           return new Promise((resolve, reject) => 
           {
                  return models.variant_images.findAll({ limit: req.self.limit, offset: req.self.offset, where: { variant: req.body.id }, attributes: ['image'] }).then(result => 
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
     * AddImage(): Adds a new image.
     * 
     * @parameters
     *        
     *          · body.[name, collection, stock, title]: 
     * 
     * @resolve
     * 
     *          · protocol.ok: Added image.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add image.
     */

    AddImage: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                 if (!req.body.rank)
                 {
                       req.body.rank = 99;
                 }
                 
                 return models.variant_images.create({ rank: req.body.rank, variant: req.body.id, image: req.body.image }, { transaction: trans1 }).then(function (result) 
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
     * RemoveImage(): Removes an image.
     * 
     * @parameters
     *        
     *          · body.[name, collection, stock, title]: 
     * 
     * @resolve
     * 
     *          · protocol.ok: Remove image.
     *
     * @reject
     *
     *          · protocol.empty: Unable to remove image.
     */

    RemoveImage: async function (req, res, next) 
    {
          return new Promise((resolve, reject) => 
          {
                    return models.sequelize.transaction(trans1 =>
                    {
                               return models.variant_images.destroy({ where: { id: req.body.id }}, { transaction: trans1 }).then(function(result)
                               {
                                        return resolve(protocol.ok);
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
     * IDExists(): Checks whether a given variant exists.
     * 
     * @parameters
     *        
     *          · body.id: Variant ID to retrieve.
     * 
     * @resolve
     * 
     *          · next(): Variant does not exists.
     *
     * @reject
     *
     *          · protocol.exists. Variant already within the server.
     */

    IDExists: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.variants.findOne({ where: { id: req.body.id, deleted: false }}).then(result => 
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
    
    /*
     * Get(): Retrieves all variants within an specific range.
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
                return models.sequelize.query("SELECT * from variants where product = :id AND deleted = :delete ORDER by variants.rank ASC LIMIT :limit OFFSET :offset",
                {
                      replacements: { limit: req.self.limit, offset: req.self.offset, delete: req.self.delete, id: req.body.id },
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
                                 let imgrslt = [];
                                     
                                 await models.variant_images.findAll({ where: { variant: item.id }, attributes: ['id', 'image'], limit: 10}).then(img =>
                                 {
                                            if (img != null)
                                            {
                                                imgrslt = img;
                                            }
                                 });
                                     
                                 if (imgrslt.length == 0)
                                 {
                                     item.images = [{ "id": 0, "image": null }];
                                 }
                                 else
                                 {
                                     item.images = imgrslt;
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
     * Delete(): Deletes a variant.
     * 
     * @parameters
     *        
     *          · body.id: Variant ID to remove.
     * 
     * @resolve
     * 
     *          · protocol.ok: Variant removed.
     *
     * @return
     *
     *          · protocol.empty: Variant ID does not exists or is alredy removed.
     */

    Delete: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.sequelize.transaction(trans1 => 
             {
                  return models.variants.update({ deleted: true }, { where: { id: req.body.id }}, { transaction: trans1 }).then(function (result) 
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
     * TitleExists(): Checks whether variant has been previously defined.
     * 
     * @parameters
     *        
     *          · body.name: Variant title to check.
     * 
     * @resolve
     * 
     *          · next(): Title does not exists.
     *
     * @return
     *
     *          · protocol.exists: Product name already defined.
     */

    TitleExists: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.variants.findOne({ where: { title: req.body.title, deleted: false }}).then(result => 
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
     * RemoveAll(): Remove all variants.
     *
     * @resolve
     *
     *        · protocol.ok: All variants removed.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to remove variants.
     *
     */

     RemoveAll: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                    return models.sequelize.transaction(trans1 =>
                    {
                               return models.variants.destroy(({ where: { }, truncate: true }, { transaction: trans1 }).then(function(result)
                               {
                                        return resolve(protocol.ok);
                               }));
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
     * GetAll(): Retrieve all variants.
     *
     * @resolve
     *
     *        · [results]: All variants found.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to fetch variants.
     *
     */

     GetAll: async function (req, res, next) 
     {
           return new Promise((resolve, reject) => 
            {
                   return models.sequelize.query("SELECT variants.id AS variant_id, variants.*, products.id AS product_id, (SELECT image FROM variant_images WHERE variant_images.variant = variants.id ORDER BY variant_images.rank DESC LIMIT 1) AS first_image FROM variants INNER JOIN products ON variants.product = products.id WHERE (:id = 0 OR products.id = :id) LIMIT :limit OFFSET :offset;", 
                   {
                        replacements: 
                        {
                             id: req.body.id,
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
     * Search(): Retrieve all variants.
     *
     * @resolve
     *
     *        · [results]: All variants found
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to fetch variants.
     *
     */

     Search: async function (req, res, next) 
     {
           return new Promise((resolve, reject) => 
           {
                   const search = "%" + req.body.value + "%";                   
                   
                   return models.sequelize.query("SELECT variants.id AS variant_id, variants.*, products.id AS product_id, (SELECT image FROM variant_images WHERE variant_images.variant = variants.id ORDER BY variant_images.rank DESC LIMIT 1) AS first_image FROM variants INNER JOIN products ON variants.product = products.id WHERE (variants.title LIKE :query) AND (:id = 0 OR products.id = :id) LIMIT :limit OFFSET :offset;", 
                   {
                        replacements: 
                        {
                             id: req.body.id,
                             query: search,
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