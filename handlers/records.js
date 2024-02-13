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
     * CountProductViews(): Counts all drivers' within your system.
     *
     * @return
     *
     *         · total: Total collections.
     */

    CountProductViews: async function (req) 
    {
          return new Promise((resolve, reject) => 
          {
                return models.product_views.count({ group: ['product'], attributes: ['product'], distinct: true,  col: 'product_views.userid' }).then(function (result) 
                { 
                     return resolve( result );
                });
          });
    },
    
    /*
     * Products(): Record viewers.
     * 
     * @parameters
     *        
     *          · body.id: Product to insert
     * 
     * @return
     *
     *          · next(): Item inserted.
     */

    Products: async function(req, res, next)
    {
          if (!req.body.view)
          {
               return next();
          }
                            
          await models.product_views.create({ userid: req.self.user, product: req.body.id });
          return next();
    },


}
