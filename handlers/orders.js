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

var Promise     =   require('promise')
var httpr       =   require('../run/httpr')
var protocol    =   require('../run/protocol')
var models      =   require('../databases/sql')
var etc         =   require('../handlers/etc')
var format      =   require('../handlers/format')
var writer      =   require('../handlers/writer')

module.exports = 
{
      /*
       * OrderAll(): Retrieve statistics for different order statuses.
       *
       * @resolve
       *        · [stats]: Combined order statistics for various statuses.
       *
       * @reject
       *        · [Error]: Any error that occurs during the process.
       */

      OrderAll: async function (req) 
      {
          return new Promise((resolve, reject) => 
          {
              /* Use Promise.all to concurrently fetch statistics for different order statuses */

              return Promise.all([
                  module.exports.OrderStats(req, "nodriver"),
                  module.exports.OrderStats(req, "pending"),
                  module.exports.OrderStats(req, "nopayment"),
                  module.exports.OrderStats(req, "cancelled"),
                  module.exports.OrderStats(req, "other")
              ])
              .then((result) => 
              {
                  /* Resolve with the calculated statistics */

                  return resolve(req.self.calc);
              })
              .catch((error) => 
              {
                  return reject(error);
              });
          });
      },

      /*
       * Totals(): Returns the total price of in a given order.
       *
       * @parameters
       *
       *          · body.id: Order ID.
       *          · self.user: User ID.
       *
       * @resolve
       *
       *          · [result]: All items.
       *
       * @reject
       *
       *          · protocol.not_found: No item found.
       */

      Totals: async function (req) 
      {
          return new Promise((resolve, reject) => 
          {
              return models.sequelize.transaction(trans1 => 
              {
                /* Find the order with the given user ID and order ID */

                return models.orders.findOne({ where: { userid: req.self.user, id: req.body.id }, transaction: trans1 }).then(function (valid) 
                {
                    if (valid == null) 
                    {
                          return reject([protocol.not_found]);
                    }

                    /* Find order totals for the specified order ID */

                    return models.order_totals.findOne({ where: { orderid: req.body.id },
                      attributes: [
                        'orderid',
                        'createdat',
                        'total',
                        'total_tax_shipping',
                        'tip',
                        'shipping',
                        'total_tax'
                      ],

                      transaction: trans1
                    })
                    .then(function (result) 
                    {
                          if (result && result.length !== 0) 
                          {
                              return resolve(result);
                          }   
                          else 
                          {
                              return reject([protocol.error]);
                          }
                    });
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
       * Info(): Returns Information about a given order.
       *
       * @parameters
       *
       *          · self.user: User ID.
       *          · body.id: Order id.
       *
       * @resolve
       *
       *          · { result }: Order info, containing status, deliver status, payment data and information
       *                        about user associated to a given order.
       *
       * @return
       *
       *          · protocol.not_found: Order not found.
       */

      Info: async function (req) 
      {
        return new Promise((resolve, reject) => 
        {
          return models.sequelize.transaction(trans1 => 
          {
            return models.orders.findOne({ where: { id: req.body.id }, attributes: ['id', 'userid', 'address', 'createdat'], transaction: trans1 }).then(result => 
            {
                if (result == null) 
                {
                   return reject([protocol.empty])
                }

                if (result == null) 
                {
                  return reject([protocol.empty])
                } 
                else 
                {
                  return models.order_status
                    .findOne({
                      where: {
                        orderid: req.body.id
                      },
                      attributes: [['status', 'order_status']],
                      transaction: trans1
                    })
                    .then(result2 => {
                      return models.order_deliver
                        .findOne({
                          where: {
                            orderid: req.body.id
                          },
                          attributes: [
                            ['status', 'deliver_status'],
                            ['code', 'deliver_code'],
                            'driver'
                          ],
                          transaction: trans1
                        })
                        .then(result3 => {
                          return models.order_totals
                            .findOne({
                              where: {
                                orderid: req.body.id
                              },
                              attributes: [
                                'shipping',
                                'total',
                                'total_tax',
                                'total_tax_shipping',
                                'tip'
                              ],
                              transaction: trans1
                            })
                            .then(result4 => {
                              return models.order_payments
                                .findOne({
                                  where: {
                                    orderid: req.body.id
                                  },
                                  attributes: [
                                    'createdat',
                                    ['payment_type', 'payment_type'],
                                    ['status', 'payment_status'],
                                    ['reason', 'payment_reason'],
                                    ['status', 'payment_status']
                                  ],
                                  transaction: trans1
                                })
                                .then(result5 => {
                                  return models.order_record
                                    .findOne({
                                      where: {
                                        orderid: req.body.id
                                      },
                                      attributes: [
                                        'address_name',
                                        'address_address',
                                        'address_city',
                                        'address_zip',
                                        'address_aptsuite',
                                        'address_options',
                                        'address_commentary'
                                      ],
                                      transaction: trans1
                                    })
                                    .then(result6 => {
                                      return models.user_info
                                        .findOne({
                                          where: {
                                            userid: result3.driver
                                          },
                                          attributes: [
                                            ['first', 'driver_first'],
                                            ['last', 'driver_last']
                                          ],
                                          transaction: trans1
                                        })
                                        .then(result_driver => {
                                          var created = {
                                            created: 
                                              result5.dataValues.createdat
                                          }
                                          var driver = null

                                          if (result_driver != null) {
                                            driver = result_driver.dataValues
                                          }

                                      return models.user_info
                                        .findOne({
                                          where: {
                                            userid: result.userid
                                          },
                                          attributes: [
                                            ['first', 'user_first'],
                                            ['last', 'user_last']
                                          ],
                                          transaction: trans1
                                        })
                                        .then(result_user => {

                                          var zresult = Object.assign(
                                            {},
                                            created,
                                            result_user.dataValues,
                                            result.dataValues,
                                            result3.dataValues,
                                            result4.dataValues,
                                            result2.dataValues,
                                            result5.dataValues,
                                            result6.dataValues,
                                            driver
                                          )
                                          return resolve(zresult)
                                        })
                                        })
                                    })
                                })
                            })
                        })
                    })
                }
              })
          })
        })
      },

    /*
     * SumBought(): Sum of all items bought.
     *
     * @parameters
     *
     *          · status: Only sum ok items.
     *
     * @return
     *
     *          · self.final: Sums of items
     */

    SumBought: async function (req) 
    {
      return new Promise((resolve, reject) => 
      {
          return models.orders.sum('total_tax_shipping', 
          {
                where: 
                {
                  userid: req.self.user,
                  status: 'ok'
                }
            })
            .then(result => 
            {
                if (!result || result.length == 0) 
                {
                    req.self.calc.total_sum = 0
                    return resolve()
                }

                req.self.calc.total_sum = result
                return resolve()
            })
            .catch(function (error) 
            {
                req.self.calc.total_sum = 0
                return resolve()
            })
      })
    },

    /*
     * ValidAdd(): Checks whether a new order has valid body parameters.
     *
     * @parameters
     *
     *          · body.items: Products to add.
     *
     * @resolve
     *
     *          · next(): Parameters provided.
     *
     * @reject
     *
     *          · online: Store is not online.
     *          · protocol.missing_param: Missing parameters.
     */

    ValidAdd: async function (req, res, next) 
    {
        if (req.app.get('online') == false) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.offline] })
        }

        if (req.app.get('orders') == false) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.no_orders] })
        }

        if (!req.body.items || !req.body.payment) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] })
        }

        return next()
    },

    ValidPreAdd: async function (req, res, next) 
    {
        if (!req.body.items) 
        {
           return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
        }

        return next()
    },

    /*
     * Products(): Returns product list associated with a given order.
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

    Products: async function (req) 
    {
      return new Promise((resolve, reject) => 
      {
        return models.orders_info
          .findAll({
            offset: req.self.offset,
            limit: req.self.limit,
            where: {
              orderid: req.body.id
            }
          })
          .then(result => {
            if (!result || result.length == 0) {
              return reject([protocol.empty])
            } else {
              return resolve(result)
            }
          })
          .catch(function (error) {
            return reject(error)
          })
      })
    },

    /*
     * CountProducts(): Counts products on a given order.
     *
     * @parameters
     *
     *          · body.orderid: Order id to count.
     *
     * @resolve
     *
     *          · [result]: counter
     *
     * @return
     *
     *          · protocol.empty: No+ Items found.
     */

    CountProducts: async function (req) 
    {
      return new Promise((resolve, reject) => 
      {
        return models.orders_info
          .count({
            where: {
              orderid: req.body.id
            }
          })
          .then(result => 
          {
              if (!result || result.length == 0) 
              {
                return reject([protocol.empty])
              } 
              else 
              {
                return resolve(result)
              }
          })
          .catch(function (error) 
          {
             return reject(error)
          })
      })
    },

    /*
     * CountUser(): Counts products on a given order.
     *
     * @parameters
     *
     *          · self.user: User
     *
     * @resolve
     *
     *          ·  total_orders: Total number of orders
     *
     */

    CountUser: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
           return models.orders.count({ where: { userid: req.self.user }}).then(result => 
           {
                if (!result || result.length == 0) 
                {
                    req.self.calc.total_orders = 0
                    return resolve();
                }

                req.self.calc.total_orders = result
                return resolve()

              })
              .catch(function (error) 
              {
                req.self.calc.total_orders = 0
                return resolve()
              })
         })
    },

    /*
     * CountMiddle(): Counts products associated to an order.
     *
     * @parameters
     *
     *          · body.orderid: Order id to count.
     *
     * @resolve
     *
     *          · [result]: counter.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

    CountMiddle: async function (req, res, next) 
    {
      try {
        const data = await module.exports.CountProducts(req)
        req.self.counter = data
      } catch (error) {
        req.self.counter = 0
      }

      return next()
    },

    /*
     * DisconnectIf(): Will disconnect an user's request if a given order
     *                 has given status.
     *
     * @parameters
     *
     *          · body.id: Order ID to check.
     *
     * @resolve
     *
     *          · protocol.empty: Order not found.
     *
     * @reject
     *
     *          · protocol.invalid_param: Invalid parameter.
     */

    DisconnectIf: function (status) 
    {
      return async function (req, res, next) 
      {
        return models.order_status
          .findOne({
            where: {
              orderid: req.body.id
            }
          })
          .then(result => 
          {
            if (!result) 
            {
              return res.status(httpr.bad_request).send({ codes: [protocol.empty] })
            } 
            else 
            {
              if (result.status == status) 
              {
                return res.status(httpr.bad_request).send({ codes: [protocol.invalid_param] });
              }

              return next()
            }
          })
      }
    },

    /* Get(): Retrieves all orders from a given user within an specific range
     *
     * @parameters
     *
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     *
     * @resolve
     *
     *          · [result]: Orders as in array.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

    Get: async function (req) 
    {
      return new Promise((resolve, reject) => 
      {
        return models.orders.findAndCountAll({ offset: req.self.offset, limit: req.self.limit, where: { userid: req.self.user }}).then(result => 
        {
            if (!result || result.length == 0) {
              return reject([protocol.empty])
            } else {
              return resolve(result)
            }
          })
          .catch(function (error) {
            return reject(error)
          })
      })
    },

    /*
     * Items(): Returns items on a given order
     *
     * @reject
     *
     *          · protocol.empty: No items found.
     */

    Items: async function (req) 
    {
      return new Promise((resolve, reject) => 
      {
        return models.sequelize.transaction(trans1 => 
        {
            return models.orders.findOne({ where: { id: req.body.id }}).then(result => 
            {
               if (!result) 
               {
                     return reject([protocol.empty])
               }

              return models.orders_info
                .findAndCountAll({
                  offset: req.self.offset,
                  limit: req.self.limit,
                  where: {
                    orderid: req.body.id
                  }
                })
                .then(items => {
                  if (!result || result.length == 0) {
                    return reject([protocol.empty])
                  } else {
                    return resolve(items)
                  }
                })
                .catch(function (error) 
                {
                  return reject(error)
                })
            })
        })
      })
    },

    /*
     * HasAny(): Has any pending order.
     *
     * @reject
     *
     *          · protocol.pending_order: Pending order.
     */

    HasAny: async function (req, res, next) 
    {
      return await models.sequelize
        .query(
          'SELECT count(*) as counter from orders INNER JOIN order_status ON order_status.orderid = orders.id where (order_status.status = "pending" AND orders.userid = :user)',
          {
            replacements: {
              user: req.self.user
            },
            type: models.sequelize.QueryTypes.SELECT
          }
        )
        .then(results => {
          if (!results) {
            return next()
          }

          if (results[0].counter > 0) {
            return res.status(httpr.bad_request).send({
              codes: [protocol.pending_order]
            })
          }

          return next()
        })
        .catch(function (error) {
          return res.status(httpr.bad_request).send({
            codes: [protocol.unknown_error]
          })
        })
    },

    /*
     * CountWhere(): Count orders where
     *
     * @resolve
     *
     *          · [array]: Params of counters.
     *
     * @reject
     *
     *          · protocol.no_assoc: No data found.
     */

    CountWhere: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.orders.count(req.self.params).then(function (result) 
             {
                 return resolve({ where: result })
             })
        })
    },

    /*
     * IDExists(): Checks whether a given order ID exists.
     *
     * @parameters
     *
     *          · body.id: Order to check.
     *
     * @resolve
     *
     *          · next(): Order does not exists.
     *
     * @return
     *
     *          · protocol.exists: Order ID already defined.
     */

    IDExists: async function (req, res, next) 
    {
      return new Promise((resolve, reject) => 
      {
        return models.orders
          .findOne({
            where: {
              id: req.body.id,
              userid: req.self.user
            },
            attributes: ['id']
          })
          .then(result => {
            if (result != null) {
              return next()
            } else {
              return res.status(httpr.bad_request).send({
                codes: [protocol.no_exists]
              })
            }
          })
      })
    },

    /*
     * IDAssociated(): Checks whether a given order ID and user are associated.
     *
     * @parameters
     *
     *          · body.id: Order to check.
     *
     * @resolve
     *
     *          · next(): Order does not exists.
     *
     * @return
     *
     *          · protocol.exists: Order ID already defined.
     */

    IDAssociated: async function (req, res, next) {
      return new Promise((resolve, reject) => {
        return models.orders
          .findOne({
            where: {
              id: req.body.id,
              userid: req.self.user
            },
            attributes: ['id']
          })
          .then(result => {
            if (result != null) {
              return next()
            } else {
              return res.status(httpr.bad_request).send({
                codes: [protocol.no_exists]
              })
            }
          })
      })
    },

    /*
     * IsCancelled(): Checks whether a given order ID has been cancelled.
     *
     * @parameters
     *
     *          · body.id: Order to check.
     *
     * @resolve
     *
     *          · next(): Order is not cancelled.
     *
     * @return
     *
     *          · protocol.exists: Order ID already cancelled.
     */

    IsCancelled: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.order_status.findOne({ where: { status: 'cancelled', orderid: req.body.id }, attributes: ['orderid']}).then(result => 
             {
                  if (result == null) 
                  {
                      return next()
                  } 
                  else 
                  {
                      return res.status(httpr.bad_request).send({ codes: [protocol.cancelled] })
                  }
             })
        })
    },

    /*
     * IsReady(): Checks whether a given order ID is ready.
     *
     * @parameters
     *
     *          · body.id: Order to check.
     *
     * @resolve
     *
     *          · next(): Order is not ready.
     *
     * @return
     *
     *          · protocol.cancelled: Order is ready.
     */

    IsReady: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.order_deliver.findOne({ where: { status: 'ready', orderid: req.body.id }, attributes: ['orderid'] }).then(result => 
            {
                 if (result == null) 
                 {
                    return next()
                 } 
                 else 
                 {
                    return res.status(httpr.bad_request).send({ codes: [protocol.ready] })
                 }
            })
         })
    },

   /*
     * DataDriver(): Returns information about a driver.
     *
     * @example:
     *
     *         {
     *             "id": 2,
     *             "driver": 2
     *         }
     *
     * @parameters
     *
     *      · req: Request object containing information about the request.
     *
     * @resolve
     *
     *         
     *      ·   first: "Driver's first name",
     *      ·   last: "Driver's last name",
     *      ·   phone: "Driver's phone number"
     *         
     *
     * @reject
     *
     *      · An array of error codes based on the protocol.
     *
     * @return
     *
     *      · Promise that resolves with protocol.ok on success or rejects with an error array on failure.
     */

    DataDriver: async function (req) 
    {
         return new Promise((resolve, reject) => 
         {
             return models.sequelize.transaction(trans1 => 
             {
                 if (!req.body.driver) 
                 {
                     return reject([protocol.no_assoc]);
                 }

                 return models.orders.findOne({ where: { userid: req.self.user, id: req.body.id }}, { transaction: trans1 }).then(init => 
                 {
                     if (!init) 
                     {
                         return reject([protocol.exists]);
                     }
    
                     return models.order_deliver.findOne({ where: { driver: req.body.driver, orderid: req.body.id }}, { transaction: trans1 }).then(function (result) 
                     {
                          if (!result) 
                          {
                               return reject([protocol.no_items]);
                          }

                          return models.user_info.findOne({ where: { userid: req.body.driver }}, { transaction: trans1 }).then(driver => 
                          {
                                if (!driver) 
                                {
                                    return reject([protocol.no_driver]);
                                }

                                return resolve({ first: driver.first, last: driver.last, phone: driver.phone
                          });
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
              return reject(error);
          });
      });
    },

    /*
     * OrderCountSearch(): Counts the number of orders based on search parameters.
     *
     * @parameters
     *
     *      · req: Request object containing information about the request.
     *      · res: Response object for sending the response back.
     *      · next: Next middleware function.
     *
     * @resolve
     *
     *      · Calls the next middleware function after setting the order count in req.self.counter.
     *
     * @reject
     *
     *      · None
     */

    OrderCountSearch: async function (req, res, next) 
    {
      return new Promise((resolve, reject) => 
      {
        var query = "";

        if (!req.body.param || req.body.param == "all") 
        {
          query =
            ' AND order_status.status IN ("ok", "pending", "nopayment", "nodriver", "cancelled", "other")';
        } else {
          query = ' AND order_status.status = "' + req.body.param + '"';
        }

        const search = "%" + req.body.id + "%";

        return models.sequelize
          .query(
            "SELECT COUNT(*) as counter from order_status INNER JOIN order_record ON order_record.orderid = order_status.orderid INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid INNER JOIN orders ON order_status.orderid = orders.id WHERE (order_record.address_address like :id) " +
              query,
            {
              replacements: 
              {
                query: query,
                id: search,
                status: req.body.param,
                limit: req.self.limit,
                offset: req.self.offset
              },

              type: models.sequelize.QueryTypes.SELECT
            }
          )
          .then(results => 
          {
            if (results.length == 0) 
            {
               /* Returns 0 if no items found */
               req.self.counter = 0;
            } 
            else
            {
               req.self.counter = results[0]["counter"];
            }

            return next();
          });
      });
    },


    /*
     * OrderCountAllPending(): Retrieve all pending orders
     *
     * @parameters
     *
     *          · param: Parameters to use
     *
     * @resolve
     *
     *          · [results]: Items that are pending.
     *
     * @reject
     *
     *          ·  protocol.empty: No items found.
     */

    OrderCountAllPending: async function (req, res, next) 
    {
      return new Promise((resolve, reject) => 
      {

         if (!req.body.param || req.body.param == "all") 
         {
               query = ' order_status.status IN ("ok", "pending", "nopayment", "nodriver", "cancelled", "other")';
         }
         else 
         {

               query = ' order_status.status = "' + req.body.param + '"';
         }

        return models.sequelize.query(
            "SELECT COUNT(*) as counter from order_status INNER JOIN order_record ON order_record.orderid = order_status.orderid INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid INNER JOIN orders ON order_status.orderid = orders.id WHERE "  +
            query,
            {
            replacements: 
            {
              query: query,
                status: req.body.param,
                limit: req.self.limit,
                offset: req.self.offset,
              },
              type: models.sequelize.QueryTypes.SELECT,
            }).then(results => 
                   { 
                         if (results.length == 0) 
                         {
                              /* Returns 0 if no items found */
                             
                              req.self.counter = 0;
                         } 
                         else 
                         {
                              req.self.counter = results[0]["counter"];
                         }

                         return next();
                   })
      });
    },
    
    /*
     * OrderGetAllPending(): Retrieve all pending orders
     *
     * @parameters
     *
     *          · param: Parameters to use
     *
     * @resolve
     *
     *          · [results]: Items that are pending.
     *
     * @reject
     *
     *          ·  protocol.empty: No items found.
     */

    OrderGetAllPending: async function (req, res, next) 
    {
      return new Promise((resolve, reject) => 
      {
          var query = "";
      
         if (!req.body.param || req.body.param == "all") 
         {
               query = ' order_status.status IN ("ok", "pending", "nopayment", "nodriver", "cancelled", "other")';
         }
         else 
         {

               query = ' order_status.status = "' + req.body.param + '"';
         }

        return models.sequelize.query(
            "SELECT * from order_status INNER JOIN order_record ON order_record.orderid = order_status.orderid INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid INNER JOIN orders ON order_status.orderid = orders.id WHERE "  +
            query + 
            " LIMIT :limit OFFSET :offset",
            {
            replacements: 
            {
              query: query,
                status: req.body.param,
                limit: req.self.limit,
                offset: req.self.offset,
              },
              type: models.sequelize.QueryTypes.SELECT,
            }
          )
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
     * PendingAllSearch(): Searches for all pending orders.
     *
     * @parameters
     *
     *          · param: Parameters to use
     *
     * @resolve
     *
     *          · [results]: Items that are pending.
     *
     * @reject
     *
     *          ·  protocol.empty: No items found.
     */

    PendingAllSearch: async function (req, res, next) 
    {
      return new Promise((resolve, reject) => 
      {
        if (!req.body.status) 
        {
          req.body.status = "pending";
        }

         if (!req.body.param || req.body.param == "all") 
         {
               query = ' AND order_status.status IN ("ok", "pending", "nopayment", "nodriver", "cancelled", "other")';
         }
         else 
         {

               query = ' AND order_status.status = "' + req.body.param + '"';
         }


        const search = "%" + req.body.id + "%";

        return models.sequelize.query("SELECT * from order_status INNER JOIN order_record ON order_record.orderid = order_status.orderid INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid INNER JOIN orders ON order_status.orderid = orders.id where (order_record.address_address like :id AND order_status.status = :status " +
              query +
              ") LIMIT :limit OFFSET :offset",
        {
              replacements: 
              {
                id: search,
                user: req.self.user,
                status: req.body.status,
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
     * GetBy(): Gets SQLs by ID.
     *
     * @example:
     *
     *          {
     *             "value": ["pending", "ok"]
     *          }
     *
     * @parameters
     *
     *          · body.status: Status to verify.
     */

     GetBy: async function(req, res, next) 
     {
         return new Promise((resolve, reject) => 
         {
               if (!req.body.param || req.body.param == "pending")
               {
                 req.body.param = ['pending'];
               }
               else
               {
                 req.body.param = ['ok', 'nopayment', 'nodriver', 'cancelled', 'other'];
               }
               
                return models.sequelize.transaction(trans => 
                {
                  const queryString = `SELECT 
                          order_status.status AS order_status, 
                        order_deliver.status AS order_deliver, 
                        order_record.*, 
                        orders.*
                    FROM order_status 
                    INNER JOIN order_record ON order_record.orderid = order_status.orderid 
                    INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid 
                    INNER JOIN orders ON order_status.orderid = orders.id 
                    WHERE order_status.status IN (:status) AND orders.userid = :user 
                    LIMIT :limit OFFSET :offset`;
                    
                    return models.sequelize.query(queryString, 
                    {
                        replacements: 
                        {
                            status: req.body.param,
                            limit: req.self.limit,
                            offset: req.self.offset,
                            user: req.self.user,
                        },
                        
                        type: models.sequelize.QueryTypes.SELECT,
                        transaction: trans,
                })
                .then((results) => 
                {
                    if (!results || results.length === 0) 
                    {
                        req.self.counter = 0; 
                        return reject([protocol.empty]);
                    }

                    /* Perform a transaction query to count the items found */
                    
                    return models.sequelize.query(`SELECT COUNT(*) as counter FROM order_status 
                        INNER JOIN order_record ON order_record.orderid = order_status.orderid 
                        INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid 
                        INNER JOIN orders ON order_status.orderid = orders.id 
                        WHERE order_status.status IN (:status)  AND orders.userid = :user`,
                        {
                            replacements: 
                            {
                                user: req.self.user,
                                status: req.body.param,
                            },
                    
                            type: models.sequelize.QueryTypes.SELECT,
                            transaction: trans,
                        })
                        .then(counter => 
                        {
                            req.self.counter = counter[0]["counter"];
                            return resolve(results);
                        });
                })
                .catch(function(error) 
                {
                    return reject(error);
                });
           });
      });
   },

    GetAllBy: async function (req) 
    {
      return new Promise((resolve, reject) => {
        return models.sequelize
          .query(
            'SELECT orders.id as id, orders.userid as userid, order_status.status as order_status, order_status.code as order_status_code, order_payments.payment_type as payment_type, order_payments.status order_payment_status, order_totals.total as total, order_totals.shipping, order_totals.total_tax_shipping, order_totals.total_tax, order_deliver.status as deliver_status, order_deliver.driver as order_deliver_driver from orders  INNER JOIN order_status ON orders.id = order_status.orderid  INNER JOIN order_deliver ON orders.id = order_deliver.orderid INNER JOIN order_payments ON orders.id = order_payments.orderid INNER JOIN order_totals ON orders.id = order_totals.orderid where order_status.status IN (:status) LIMIT :limit OFFSET :offset',
            {
              replacements: {
                status: req.body.value,
                limit: req.self.limit,
                offset: req.self.offset
              },
              type: models.sequelize.QueryTypes.SELECT
            }
          )
          .then(results => {
            if (!results || results.length == 0) {
              return reject([protocol.empty])
            } else {
              return resolve(results)
            }
          })
          .catch(function (error) {
            return reject([protocol.unknown_error])
          })
      })
    },

    /*
     * HistoricInfo(): Returns information on a given historic order.
     *
     * @parameters
     *
     *          · self.user: Self user
     *
     * @resolve
     *
     *          · [result]: Result on historic data.
     *
     * @reject
     *
     *          · protocol.empty: Data is empty.
     */

    HistoricInfo: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.orders.findOne({ where: { userid: req.self.user, id: req.body.id }}).then(result => 
             {
                    if (result == null) 
                    {
                          return reject([protocol.empty])
                    } 
                    else 
                    {
                          return models.order_record.findOne({ where: { orderid: req.body.id }}).then(result2 => 
                          {
                                  return models.order_deliver.findOne({ where: { orderid: req.body.id }}).then(result3 => 
                                  {
                                          return models.order_totals.findOne({ where: { orderid: req.body.id }}).then(result4 => 
                                          {
                                                return models.order_payments.findOne({ where: { orderid: req.body.id }}).then(result5 => 
                                                {
                                                      return resolve({ order: result, historic: result2, deliver: result3, totals: result4, payments: result5 })
                                                })
                                           })
                                  })
                           })
                    }
             })
        })
    },

    /*
     * OrderStats(): Counts the number of orders with a specific status within a given time frame.
     *
     * @parameters
     *
     *      · req: Request object containing information about the request.
     *      · status: The status of the orders to be counted.
     *
     * @resolve
     *
     *      · Updates req.self.calc with the count of orders for the specified status.
     *      · protocol.ok: Success.
     *
     * @reject
     *
     *      · An array of error codes based on the protocol, e.g., [protocol.no_exists].
     */

    OrderStats: async function (req, status) 
    {
          return new Promise((resolve, reject) => 
          {
              var days = 1;

              if (req.body.days) 
              {
                  days = req.body.days;
              }

              return models.sequelize.query("SELECT count(*) as counter FROM `order_status` WHERE status = :status AND DATE(`createdat`) > (DATE_SUB(CURDATE(), INTERVAL :days DAY))", 
              {
                  replacements: 
                  {
                      days,
                      status
                  },

                  type: models.sequelize.QueryTypes.SELECT

              })
              .then(data => 
              {
                  if (!data) 
                  {
                      return reject([protocol.no_exists]);
                  } 
                  else 
                  {
                      req.self.calc[status] = data[0]["counter"];
                      return resolve(protocol.ok);
                  }
              })
              .catch(function (error) 
              {
                  return reject(error);
              });
          });
      },
}
