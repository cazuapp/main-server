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
var etc       =  require('../handlers/etc');
var writer    =  require('../handlers/writer');

module.exports = 
{
    /* 
     * CheckItems(): Checks whether all items are in store.
     *
     * @parameters
     *
     *         · body.items: Items to process.
     *
     * @reject
     *
     *        · order_limit_exceed: Order exceed.
     */

    CheckItems: async function(req, res, next)
    {
            if (!req.body.items)
            {
                return res.status(httpr.bad_request).send({ codes: [protocol.no_items] });
            }
            
            var items = req.body.items;
            var final = [];

            req.self.final     = [];
            var counter = 0.0;

            if (items.length > process.env.ORDER_LIMIT)
            {
                return res.status(httpr.bad_request).send({ codes: [protocol.order_limit_exceed] });
            }
             
            for (var key of items) 
            {
                if (!key.variant)
                {
                     return res.status(httpr.bad_request).send({ codes: [protocol.missing_param]});
                }
                
                if (!key.quantity)
                {
                      key.quantity = 1;
                }

                var variant = await models.variants.findOne({ where: { id: key.variant, deleted: false }});
                
                if (variant == null)
                {
                      return res.status(httpr.bad_request).send({ codes: [protocol.no_exists], id: key.variant });
                }
                
                var total = variant.price * key.quantity;
                counter += total;
                
                var item = { "variant": key.variant, "quantity": key.quantity, "total": total, "variant_name":  variant.title, "total_unit": variant.price };
                final.push(item);
            }
            
            req.self.total = etc.round2(counter);
            req.self.total_tax = etc.round2((counter * req.app.get('tax')) / 100);
            req.self.shipping =  etc.round2(Number(req.app.get('shipping')));
            req.self.total_tax_shipping = etc.round2(req.self.total_tax + req.self.shipping + req.self.total);
            req.self.tip = 0;
            
            req.self.final = final;
            return next();
    },

    /*
     * PreAdd(): Returns price calculation 
     * 
     * @parameters
     *        
     *          · body.[items]: order to add.
     */

    PreAdd: async function (req) 
    {
         return new Promise((resolve, reject) => 
         {
                return resolve({ total: req.self.total, total_tax: req.self.total_tax, shipping: req.self.shipping, total_tax_shipping: req.self.total_tax_shipping });                                              
         });
    },
    
    /*
     * Add(): Adds a new order.
     * 
     * @parameters
     *        
     *          · body.[items]: order to add.
     *          · body.: Order to deliver this order to.
     * 
     * @resolve
     * 
     *          · protocol.ok: Added order.
     *
     * @reject
     *
     *          · protocol.empty: Unable to add order.
     *
     * @example: An inserting query can be run from your favorite json editor:
     *
     *          {
     *               "items": [{ "variant": 1, "quantity": 10 }, { "variant": 2 }],
     *               "address": 1,
     *               "payment": 1
     *          }
     */

    Add: async function (req) 
    {
         return new Promise((resolve, reject) => 
         {
                 return models.sequelize.transaction(trans1 => 
                 {
                      return models.orders.create({ userid: req.self.user, address: req.body.address }, { transaction: trans1 }).then(function (result) 
                      {
                           return models.order_payments.create({ payment_type: req.body.payment, orderid: result.id }, { transaction: trans1 }).then(function (result2) 
                           {
                                   var final = [];

                                   for (var key of req.self.final) 
                                   {
                                          key["orderid"] = result.id;
                                          key["variant_historic"] = key.variant_name;
                                          final.push(key);
                                   }
                                   
                                   return models.orders_info.bulkCreate(final, { transaction: trans1 }).then(function (result3) 
                                   {
                                            return models.order_status.create({ orderid: result.id, status: "pending", code: null, reason: null, }, { transaction: trans1 }).then(function (result4) 
                                            {
                                                   return models.order_deliver.create({ orderid: result.id }, { transaction: trans1 }).then(function (result5) 
                                                   {
                                                           return models.order_totals.create({ orderid: result.id, total: req.self.total, shipping: req.self.shipping, total_tax: req.self.total_tax, tip: req.self.tip, total_tax_shipping: req.self.total_tax_shipping }, { transaction: trans1 }).then(function (result6) 
                                                           {
                                                                    return models.order_record.create({ orderid: result.id, address_address: req.self.address["address"], address_source: req.body.address, address_name: req.self.address["name"], address_city: req.self.address["city"], address_zip: req.self.address["zip"], address_aptsuite: req.self.address["aptsuite"], address_options: req.self.address["options"], commentary: req.self.address["commentary"] }, { transaction: trans1 }).then(function (result9) 
                                                                    {
                                                                         return { id: result.id, created: result4.createdat, total: req.self.total, total_tax: req.self.total_tax, shipping: req.self.shipping, total_tax_shipping: req.self.total_tax_shipping };
                                                                    });
                                                           });
                                                   });
                                            });
                                   });
                           });
                      });
                 })
                 .then(result => 
                 {
                         const subject = "Your order has been placed";

                         var data = { title: subject, address1: req.self.address["address"], address2: req.self.address["city"], address3: req.self.address["aptsuite"], zipcode: req.self.address["zipcode"], name: req.self.first, email: req.self.email, order_id: result.id, amount_due: req.self.total, invoice_data: result.created };
                         writer.SendMail(req, req.self.email, subject, data, "emails/order_placed.ejs");

                         return resolve({ id: result.id, created: result.created, total: result.total, total_tax: result.total_tax, total_shipping: result.total_shipping, shipping: result.shipping, total_tax_shipping: result.total_tax_shipping, status: "pending" });
                 })
                 .catch(error => 
                 {
                     return reject(error);
                 });
         });
    }
}