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
var Privs      =  require('../handlers/privs');

module.exports =
{
    /*
     * CanCheck(): Check if can be checked.
     * 
     * @parameters
     *        
     *          · self.user: User id to check against.
     * 
     * @reject
     *
     *          · no_exists: User does not exists.
     */

    CanCheck: async function(req, res, next)
    {
          if (!req.body.code)
          {
               req.body.code = null;
          }

          if (!req.body.reason)
          {
               req.body.reason = null;
          }

          /* Check if given user has been assigned this order */
          
          return models.order_deliver.findOne({ where: { orderid: req.body.id }, attributes: ['driver'] }).then(function (result) 
          {
                if (result == null)
                {
                     return res.status(httpr.bad_request).send({ codes: [protocol.no_exists] });
                }
                
                /* A manager does not need to check for association */
  
                if (Privs.RootOrManager(req) == 1)
                {
                    return next();
                }
                
                /* Requesting user is not managing this order */
                
                if (req.self.user != result.driver)
                {
                     return res.status(httpr.bad_request).send({ codes: [protocol.no_assoc] });
                }
                
                return next();
          });
    },
    
    /*
     * PaymentFailed(): Payment failed.
     * 
     * @parameters
     *        
     *          · body.value: Payment reason.
     *          · body.code: Code reason.
     * 
     * @resolve
     * 
     *          · protocol.ok: 
     *
     * @reject
     *
     *          · protocol.empty: No order found.
     */

    PaymentFailed: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                        return models.orders.findOne({ where: { id: req.body.id }}).then(function (init) 
                        {
                            if (!init)
                            {
                                  return reject([protocol.empty]);
                            }
                
                            return models.order_payments.update({ status: req.body.value, code: req.body.code, reason: req.body.reason }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result)
                            {
                                  return models.order_status.update({ status: "nopayment" }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result2)
                                  {
                                          return resolve(1);
                                  });
                            })
                            .catch(function (error) 
                            { 
                                  return reject([protocol.operation_failed]);
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
     * PaymentOK(): Payment ok.
     * 
     * @parameters
     *        
     *          · body.orderid: Order ID to update.
     * 
     * @resolve
     * 
     *          · protocol.ok: Payment status updated. 
     *
     * @reject
     *
     *          · protocol.empty: No order found.
     */

    PaymentOK: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                      return models.orders.findOne({ where: { id: req.body.id }}, { transaction: trans1 }).then(function (init) 
                      {
                           if (!init)
                           {
                                  return reject([protocol.empty]);
                           }
                
                           return models.order_payments.update({ status: "ok" }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result)
                           {
                                   return resolve(protocol.ok);
                           })
                           .catch(function (error) 
                           {
                                   return reject([protocol.operation_failed]);
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
     * DeliverOK(): Deliver ok.
     * 
     * @parameters
     *        
     *          · body.orderid: Order ID to check.
     * 
     * @resolve
     * 
     *          · protocol.ok: Deliver status ok.
     *
     * @reject
     *
     *          · protocol.empty: No order found.
     */

    DeliverOK: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                        return models.orders.findOne({ where: { id: req.body.id }}).then(function (init) 
                        {
                                 if (!init)
                                 {
                                       return reject([protocol.empty]);
                                 }

                                 return models.order_deliver.update({ status: "ok", delivered_at: models.sequelize.literal('CURRENT_TIMESTAMP') }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result3)
                                 {
                                        return models.order_status.update({ status: "ok", delivered_at: models.sequelize.literal('CURRENT_TIMESTAMP') }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result3)
                                        {
                                             return resolve(protocol.ok);
                                        });
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
     * DeliverPending(): Deliver is pending.
     * 
     * @parameters
     *        
     *          · body.orderid: Order ID to check.
     * 
     * @resolve
     * 
     *          · protocol.ok: Deliver status set to pending.
     *
     * @reject
     *
     *          · protocol.empty: No order found.
     */

    DeliverPending: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                        return models.orders.findOne({ where: { id: req.body.id }}).then(function (init) 
                        {
                                 if (!init)
                                 {
                                       return reject([protocol.empty]);
                                 }

                                 return models.order_status.update({ status: "pending" }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result3)
                                 {
                                        return resolve(protocol.ok);
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
     * Cancel(): Cancels an order.
     * 
     * @parameters
     *        
     *          · body.id: Order ID to cancel.
     *          · body.code: Code not found.
     *          · body.reason: Reason provided to cancel.
     * 
     * @resolve
     * 
     *          · protocol.ok: Cancelled order.
     *
     * @reject
     *
     *          · protocol.empty: Unable to cancel order.
     */

    Cancel: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                 if (!req.body.code)
                 {
                       req.body.code = null;
                 }
                 
                 if (!req.body.reason)
                 {
                      req.body.reason = null;
                 }
                 
                 return models.orders.findOne({ where: { userid: req.self.user, id: req.body.id }}).then(function (init) 
                 {
                         if (!init)
                         {
                               return reject([protocol.empty]);
                         }
                 
                         return models.order_status.update({ status: "cancelled", code: req.body.code, reason: req.body.reason }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function (result) 
                         {
                               return resolve(protocol.ok);
                         });
                 });
            })
            .then(result => 
            {
                 const subject = "Your order has been canceled";
                 var data = { order_id: req.body.id, title: subject };
                 
                  /* Sends email notifying that order has been cancelled */
                  
                 writer.SendMail(req, req.self.email, subject, data, "emails/order_canceled.ejs");

                 return resolve(protocol.ok);
            })
            .catch(error => 
            {
                 return reject(error);
            });
        });
    },

    /*
     * DeliverFailed(): Deliver has failed.
     * 
     * @parameters
     *        
     *          · body.orderid: Order ID to check.
     * 
     * @resolve
     * 
     *          · protocol.ok: Deliver status set to failed.
     *
     * @reject
     *
     *          · protocol.empty: No order found.
     */

    DeliverFailed: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                         return models.orders.findOne({ where: { userid: req.self.user, id: req.body.id }}).then(function (init) 
                         {
                              if (!init)
                              {
                                  return reject([protocol.empty]);
                              }
                
                              return models.order_deliver.update({ status: req.body.value, code: req.body.code, reason: req.body.reason }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result)
                              {
                                    return models.order_status.update({ status: "nodriver" }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result2)
                                    {
                                         return resolve(protocol.ok);
                                    });
                              });
                         })
                         .catch(function (error) 
                          {
                                return reject([protocol.operation_failed]);
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
    
    SetStatus: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                if (!req.body.code)
                {
                     req.body.code = null;
                }

                if (!req.body.reason)
                {
                     req.body.reason = null;
                }
                
                return models.sequelize.transaction(trans1 =>
                {
                         return models.orders.findOne({ where: { userid: req.self.user, id: req.body.id }}).then(function (init) 
                         {      
                                 if (!init)
                                 {
                                       return reject([protocol.empty]);
                                 }
                                 
                                 return models.order_status.update({ status: req.body.key, code: req.body.code, reason: req.body.reason }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result2)
                                 {
                                          return resolve(protocol.ok);
                                 });
                                       
                                 }).catch(function (error) {
                                    
                                       return reject([protocol.operation_failed]);
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
    },

    /*
     * GetStatus(): Returns current status on a given order.
     * 
     * @parameters
     *        
     *          · body.orderid: Order ID to look for.
     * 
     * @resolve
     * 
     *          · [data]: Order data.
     *
     * @reject
     *
     *          · protocol.empty: No order found.
     */
    
    GetStatus: async function(req)
    {
          return new Promise((resolve, reject) =>
          {
                return models.sequelize.transaction(trans1 =>
                {
                      return models.orders.findOne({ where: { id: req.body.id }}).then(function (init) 
                      {      
                             if (!init)
                             {
                                  return reject([protocol.empty]);
                             }
                                 
                             return models.order_status.findOne({ where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result2)
                             {
                                  return models.order_payments.findOne({ where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result3)
                                  {
                                         return models.order_deliver.findOne({ where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result4)
                                         {
                                                  return resolve({ deliver: result4.status, payment: result3.status, status: result2.status });
                                         });
                                  });
                             });
                                       
                      })
                      .catch(function (error) 
                      {
                             return reject([protocol.operation_failed]);
                      });
                });
          })
          .then(result => 
          {
                    return result;
          })
          .catch (error => 
          {
                   return error;
          });
    },


}