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
       * List(): Retrieves all home's items within an specific range.
       *
       * @parameters
       *
       *          · body.[offset, limit]: Range
       *
       * @resolve
       *
       *          · [result]: Home list.
       *
       * @return
       *
       *          · protocol.no_exists: No Items found.
       */

      List: async function (req) 
      {
          return new Promise((resolve, reject) => 
          {
               return models.sequelize.query("SELECT p.id, p.name, p.description, p.collection, c.title AS collection_title, p.createdat AS createdat, MIN(v.price) AS price, MIN((SELECT vi.image FROM variant_images vi WHERE vi.variant = v.id LIMIT 1)) AS image FROM products p LEFT JOIN variants v ON p.id = v.product LEFT JOIN collections c ON p.collection = c.id WHERE p.deleted = false AND (:id = 0 OR p.collection = :id) GROUP BY p.id, p.name, p.description, p.collection, c.title, p.createdat ORDER BY p.name DESC LIMIT :limit OFFSET :offset;",
               {
                    replacements: 
                    {
                        limit: req.self.limit,
                        offset: req.self.offset,
                        id: req.body.id,
                    },
                  
                    type: models.sequelize.QueryTypes.SELECT,
               })
               .then((results) => 
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
       * Search(): Searches for products based on the product name.
       *
       * @parameters
       *
       *   · body.value: Search term for product names.
       *
       * @resolve
       *
       *   · [result]: List of products matching the search criteria.
       *
       * @return
       *
       *   · protocol.no_exists: No matching products found.
       */
       
      Search: async function (req) 
      {
          return new Promise((resolve, reject) => 
          {
              return models.sequelize.query("SELECT p.id, p.name, p.description, p.collection, c.title AS collection_title, p.createdat AS createdat, MIN(v.price) AS price, MIN((SELECT vi.image FROM variant_images vi WHERE vi.variant = v.id LIMIT 1)) AS image FROM products p LEFT JOIN variants v ON p.id = v.product LEFT JOIN collections c ON p.collection = c.id WHERE p.deleted = false AND (:id = 0 OR p.collection = :id) AND p.name LIKE :query GROUP BY p.id, p.name, p.description, p.collection, c.title, p.createdat ORDER BY p.name DESC LIMIT :limit OFFSET :offset;",
              {
                    replacements: 
                    {
                          id: req.body.id,
                          query: req.body.value,
                          limit: req.self.limit,
                          offset: req.self.offset,
                    },

                    type: models.sequelize.QueryTypes.SELECT,
              })
              .then((results) => 
              {
                    if (!results || results.length === 0) 
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
};
