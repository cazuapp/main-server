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

var Promise    =  require("promise");
var httpr      =  require("../run/httpr");
var protocol   =  require("../run/protocol");
var models     =  require("../databases/sql");

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
                return models.products.count({ group: ["collection"], attributes: ["collection"], limit: 10 }).then(function (result)
                {
                     return resolve(result);
                });
          });
     },

     /*
      * ValidAdd(): Checks whether new products has valid body parameters.
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
          if (!req.body.name || !req.body.collection || req.body.collection == 0)
          {
               return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
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
               return models.sequelize.transaction((trans1) => 
               {
                         /* Product names must be unique */
                         
                         return models.products.findOne({ where: { name: req.body.name }}).then((init) =>
                         {
                                   if (init)
                                   {
                                        return reject([protocol.exists]);
                                   }

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
                         });
                    })
                    .then((result) =>
                    {
                         return resolve(protocol.ok);
                    })
                    .catch((error) =>
                    {
                         Logs.error({ url: req.originalUrl, headers: req.headers, body: req.body, error: error }, process.env.ROUTE_STREAM);
                         return reject(error);
                    });
          });
     },

     /*
      * SimpleAdd(): Adds a new product, and a variant at the same time.
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

     SimpleAdd: async function (req)
     {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction((trans1) =>
                {
                        return models.products.create({
                                        collection: req.self.params["collection"],
                                        description: req.self.params["description"],
                                        name: req.self.params["name"],
                                        image: req.self.params["imagesrc"]
                                   },{ transaction: trans1 }).then(function (result)
                        {
                                   if (result && result.length != 0)
                                   {
                                        return models.variants
                                             .create(
                                                  {
                                                       rank: req.self.params["rank"],
                                                       stock: req.self.params["stock"],
                                                       product: result.id,
                                                       title: req.self.params["title"],
                                                       price: req.self.params["price"],
                                                  },
                                                  { transaction: trans1 }
                                             )
                                             .then(function (result2)
                                             {
                                                  return models.variant_images.create({ variant: result2.id, image: req.self.params["imagesrc"] }, { transaction: trans1 }).then(function (result3)
                                                  {
                                                            return resolve({ id: result2.id });
                                                  });
                                             });
                                   } 
                                   else
                                   {
                                        return reject([protocol.empty]);
                                   }
                        });
                    })
                    .then((result) =>
                    {
                         return resolve(protocol.ok);
                    })
                    .catch((error) =>
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
               return models.sequelize.transaction((trans1) =>
               {
                        return models.products.findOne({ where: { id: req.body.id }}, { transaction: trans1 }).then((init) =>
                        {
                                if (!init)
                                {
                                      return reject([protocol.not_found]);
                                }

                                /* Deletes variant by updating delete bool */
                                   
                                return models.variants.update({ deleted: true }, { where: { product: req.body.id }}, { transaction: trans1 }).then(function (result)
                                {
                                         if (result && result.length != 0)
                                         {
                                                  return models.products.update({ deleted: true }, { where: { id: req.body.id }}, { transaction: trans1 }).then(function (result2)
                                                  {
                                                         return models.favorites.destroy({ where: { userid: req.self.user, product: req.body.id }}, { transaction: trans1 }).then(function (result3)
                                                         {
                                                                 return resolve(protocol.ok);
                                                         });
                                                  });
                                             } 
                                             else
                                             {
                                                  return reject([protocol.empty]);
                                             }
                                        });
                              });
                    })
                    .then((result) =>
                    {
                         return resolve(protocol.ok);
                    })
                    .catch((error) =>
                    {
                         Logs.error({ url: req.originalUrl, headers: req.headers, body: req.body, error: error }, process.env.ROUTE_STREAM);
                         return reject(error);
                    });
          });
     },

     /*
      * NameExists(): Checks whether product has been previously added.
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
                return models.products.findOne({ where: { name: req.body.name }}).then((result) =>
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

     Info: async function (req)
     {
          return new Promise((resolve, reject) =>
          {
               return models.sequelize.query("SELECT * from products where deleted = :delete AND id = :id LIMIT 1", { replacements: { delete: req.self.delete, id: req.body.id }, type: models.sequelize.QueryTypes.SELECT }).then((results) =>
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
                                   let collection_name = null;

                                   await models.variants
                                        .findOne({
                                             where: {
                                                  product: item.id,
                                             },
                                        })
                                        .then(async (idmg) =>
                                        {
                                             if (!idmg)
                                             {
                                             
                                             item.price = 0;
                                             }
                                             else
                                             {
                                             item.price = idmg.price;

                                             await models.variant_images
                                                  .findOne({
                                                       where: {
                                                            variant: idmg.id,
                                                       },
                                                  })
                                                  .then(async (img) =>
                                                  {
                                                       if (img != null)
                                                       {
                                                            imgrslt = img.image;
                                                       }

                                                       await models.collections
                                                            .findOne(
                                                                 {
                                                                      where: {
                                                                           id: item.collection,
                                                                      },
                                                                 },
                                                                 { attributes: ["title"] }
                                                            )
                                                            .then((coll) =>
                                                            {
                                                                 collection_name = coll.title;
                                                            });
                                                  });
                                                  }
                                        });

                                   if (imgrslt == null)
                                   {
                                        item.image = null;
                                   } else
                                   {
                                        item.image = imgrslt;
                                   }

                                   if (collection_name == null)
                                   {
                                        item.collection_name = null;
                                   } else
                                   {
                                        item.collection_name = collection_name;
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
      * IDExists(): Checks whether a given product exists. Disconnects user if
      *             not present.
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
                return models.products.findOne({ where: { id: req.body.id, deleted: false }}).then((result) =>
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
          var MyItems = req.body.items;
          var missing = [];
          req.self.total = 0;
          req.self.total_tax = 0;
          req.self.info = new Map();
          var all = {};

          for (const key of MyItems)
          {
               var result = await models.products.findOne({ where: { id: key.product, deleted: false}});

               var item = {};

               item["id"] = result.id;
               item["collection"] = result.collection;
               item["name"] = result.name;
               item["variant"] = result.variant;

               all[result.id] = item;

               if (result == null)
               {
                    missing.push(key.product);
               } else
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

                    req.self.info = all;

                    if (result.variant != null && result.variant > 0)
                    {
                         var variant = await models.variants.findOne({ where: { id: key.variant, deleted: false }});
                         
                         req.self.total = req.self.total + (result.price + result.minusplus) * key.quantity;
                    } 
                    else
                    {
                         req.self.total = req.self.total + result.price * key.quantity;
                    }
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
               return models.products.findAll({ offset: req.self.offset, limit: req.self.limit }, { where: { deleted: false, collection: req.body.id }, attributes: ["id", "collection", "name", "createdat"] }).then((result) =>
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

     Update: async function (req)
     {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction((trans1) =>
                {
                         return models.products.findOne({ where: { id: req.body.id, deleted: false }}).then((init) =>
                         {
                                if (!init)
                                {
                                      return reject([protocol.no_exists]);
                                }

                                /* Update product */
                                
                                return models.products.update(req.self.params, { where: { id: req.body.id }}, { transaction: trans1 }).then(function (result)
                                {
                                      if (result && result.length != 0)
                                      {
                                             return resolve(protocol.ok);
                                      } 
                                      else
                                      {
                                             return reject([protocol.unknown_error]);
                                      }
                               });
                         });
                })
                .then((result) =>
                {
                         return resolve(protocol.ok);
                })
                .catch((error) =>
                {
                       return reject([protocol.unknown_error]);
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
               return models.sequelize
                    .transaction((trans1) =>
                    {
                         return models.options.destroy(
                              ({
                                   where: {},
                                   truncate: true,
                              },
                                   { transaction: trans1 }).then(function (result)
                                   {
                                        return models.products
                                             .destroy(
                                                  {
                                                       where: {},
                                                       truncate: true,
                                                  },
                                                  { transaction: trans1 }
                                             )
                                             .then(function (result2)
                                             {
                                                  return resolve(protocol.ok);
                                             });
                                   })
                         );
                    })
                    .then((result) =>
                    {
                         return resolve(protocol.ok);
                    })
                    .catch((error) =>
                    {
                         return reject([protocol.operation_failed]);
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
};
