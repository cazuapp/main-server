/*
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

var Promise      =   require('promise');
var bcrypt       =   require('bcryptjs');
var httpr        =   require('../run/httpr');
var protocol     =   require('../run/protocol');
var models       =   require('../databases/sql');
var etc          =   require('../handlers/etc');
var Logs         =   require('../run/transport');
var writer       =   require('../handlers/writer');
var Orders       =   require('../handlers/orders');
var Address      =   require('../handlers/address');
var Favorites    =   require('../handlers/favorites');
var Payments     =   require('../handlers/payments');
var base64       =   require('js-base64');

module.exports = 
{
    /*
     * Search(): Searches for users after a provided search value.
     *                 
     * @return
     * 
     *         · [user]: Array list containing users.
     *         
     * @reject
     *
     *        · protocol.empty: No users found.
     */

     Search: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                return models.sequelize.query("SELECT users.id, user_info.first, user_info.last, users.email, users.createdat as created FROM users RIGHT JOIN user_info ON users.id = user_info.userid WHERE (user_info.first like :search_query OR users.email like :search_query OR user_info.last like :search_query) LIMIT :limit OFFSET :offset",
                {
                        replacements: 
                        {
                            search_query: req.body.value,
                            limit: req.self.limit,
                            offset: req.self.offset,
                        },
                        
                        type: models.sequelize.QueryTypes.SELECT,
                
                }).then((results) => 
                {
                      if (!results || results.length == 0) 
                      {
                            return reject([protocol.empty]);
                      }

                      return resolve(results);
                      
                }).catch(function (error) 
                {
                      return reject(error);
                });
          });
     },

    /*
     * GetList(): Retrieve a list of users with additional information.
     *
     * @resolve
     *
     *        · [results]: List of users with additional information.
     *
     * @reject
     *
     *        · protocol.empty: No users found.
     */
     
     GetList: async function (req, res, next) 
     {
          return new Promise((resolve, reject) => 
          {
                return models.sequelize.query("SELECT users.id, user_info.first, user_info.last, users.email, users.createdat as created FROM users RIGHT JOIN user_info ON users.id = user_info.userid ORDER BY users.email ASC LIMIT :limit OFFSET :offset",
                {
                        replacements: 
                        {
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
                
                }).catch(function (error) 
                {
                       return reject(error);
                });
          });
     },

    /*
     * AdvancedInfo(): Returns detailed information about a given user.
     *                 
     * @return
     * 
     *         · resolve: Information about given user.
     *         
     * @reject
     *
     *        · protocol.empty: User ID does not exists.
     */

    AdvancedInfo: async function(req)
    {
         return new Promise((resolve, reject) => 
         {
              return models.sequelize.transaction(trans1 =>
              {
                   return models.users.findOne({ where: { id: req.body.id }, attributes: ['id', 'email', 'createdat'] }, { transaction: trans1 }).then(function (init) 
                   {
                        if (!init)
                        {
                             return reject([protocol.empty]);
                        }
                        
                        /* Nested queries */

                        return models.user_info.findOne({ where: { userid: req.body.id }, attributes: ['first', 'last', 'verified', 'fullname'] }, { transaction: trans1 }).then(function (info) 
                        {
                            return models.bans.findOne({ where: { userid: req.body.id }, attributes: [['code', 'ban_code']] }, { transaction: trans1 }).then(function (ban) 
                            {
                                 return models.holds.findOne({ where: { userid: req.body.id }, attributes: ['able_to_order', 'health'] }, { transaction: trans1 }).then(function (holds) 
                                 {
                                       return models.favorites.count({ where: { userid: req.body.id }}, { transaction: trans1 }).then(function (favorites)  
                                       {
                                              return models.address.count({ where: { userid: req.body.id, deleted: false }}, { transaction: trans1 }).then(function (address)  
                                              {
                                                    return models.user_roles.findOne({ where: { userid: req.body.id }, attributes: ['root_flags', 'can_manage', 'can_assign']}, { transaction: trans1 }).then(function (roles)  
                                                    {
                                                          return models.drivers.findOne({ where: { userid: req.body.id }, attributes: [['available', 'driver_status']] }, { transaction: trans1 }).then(function (driver)  
                                                          {
                                                                  var zresult = Object.assign({}, roles != null ? roles.dataValues : { }, { address: address }, { favorites: favorites }, info.dataValues, init.dataValues, favorites, address, driver == null ? { is_driver: false } : { is_driver: true }, driver != null ? { driver_status: etc.as_bool(driver.dataValues.driver_status) } : { driver_status: false }, ban != null ? ban.dataValues : { ban_code: "noban" }, holds != null ? { able_to_order: etc.as_bool(holds.dataValues.able_to_order), health: etc.as_bool(holds.dataValues.health) } : { able_to_order: true, health: true });                                                
                                                                  return resolve(zresult);
                                                          });
                                                    });
                                              }); 
                                       });
                                 });
                            });
                        });
                   });
              })
         });
    },
     
     /*
     * GetDefaults(): Returns list of defaults settings on a given user.
     * 
     * @resolve
     * 
     *          · Default items, include Address.
     */

    GetDefaults: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            req.self.final = {};

            return Promise.all([Address.GetDefault(req)]).then((result) => 
            {
                return resolve(result);
            });
        });
    },

    /*
     * Stats(): Stats on a given user.
     * 
     * @resolve
     * 
     *          · [items]: All promises, include Orders, Addresses, Total bought
     *                     and favorites.
     */

    Stats: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return Promise.all([Orders.CountUser(req), Address.CountUser(req), Orders.SumBought(req), Favorites.CountUser(req)]).then((values) => 
            {
                 return resolve(req.self.calc);
            });
        });
    },

    /*
     * PreSignup(): Pre-registration middleware. Verifies whether an email is taken.
     *
     * @parameters
     *
     *         · body.email: Email to check.
     *
     * @return
     *
     *         · next(): Middleware passed.
     *
     * @reject
     *
     *         · protocol.email_exists: Email is taken
     */

    PreSignup: async function (req, res, next) 
    {
        return module.exports.EmailExists(req).then(function (result) 
        {
              Logs.error({ url: req.originalUrl, headers: req.headers, body: req.body, error: protocol.email_exists }, process.env.ROUTE_STREAM);
              return res.status(httpr.bad_request).send({ codes: [protocol.email_exists] });
              
        })
        .catch(function (error) 
        {
            if (req.body.lang != null) 
            {
                req.self.lang = req.body.lang;
            }

            return next();
        })
    },

    /*
     * CountAll(): Counts all users' within your system.
     *
     * @return
     *
     *         · total: Total users.
     */

    CountAll: async function () 
    {
         return new Promise((resolve, reject) => 
         {
              return models.user_info.count().then(function (result) 
              {
                    return resolve(result);
              });
         });
    },

    /*
     * CountWhere(): Counts all users' using certain parameters within your system.
     *
     * @return
     *
     *         · total: Total users.
     */

    CountWhere: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.users.count(req.self.params).then(function (result) 
             {
                  return resolve({where: result});
             });
        });
    },

    /*
     * CheckClosed(): Checks whether an user has closed his/her account.
     *                If active, will re-activate user.
     *                 
     * @return
     * 
     *         · next(): Check OK.
     */

    CheckClosed: async function (req, res, next) 
    {
        if (!req.self.active) 
        {
            await models.users.update({ active: 1 }, { where: { id: req.self.user }});
        }

        return next();
    },

    /*
     * Close(): Closes an account by updating the 'active' field to 'false'.
     *                 
     * @return
     * 
     *         · resolve: Account has been closed.
     *         
     * @reject
     *
     *        · protocol.no_exists: User No exists.
     */

    Close: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
               return models.sequelize.transaction(trans1 =>
               {
                        return models.users.update({ active: false }, { where: { id: req.self.user }}, { transaction: trans1 }).then(result => 
                        {
                             return models.drivers.destroy({ where: { userid: req.self.user }}, { transaction: trans1 }).then(driver => 
                             {
                                    return models.bans.destroy({ where: { userid: req.self.user }}, { transaction: trans1 }).then(driver => 
                                    {
                                            if (result != null) 
                                            {
                                                  return resolve(result);
                                            } 
                                            else 
                                            {
                                                 return reject([protocol.no_exists]);
                                            }
                                    });
                             });
                        });
               });
        });
    },

    /*
     * SwitchUpdate(): Switches a password from password to new.
     *
     * @return
     * 
     *         · next(): Switch success.
     */

    SwitchUpdate: async function (req, res, next) 
    {
         req.body.password = req.body.new;
         return next();
    },

    /*
     * VerifyPass(): Checks whether a password has been provided.
     *
     * @return
     *
     *         · missing_param: Email has not been provided.
     *         · bad_format: Email has a bad format.
     */

    VerifyPass: async function (req, res, next) 
    {
        return bcrypt.compare(req.body.password, req.self.password, function (error, response) 
        {
            if (response == true) 
            {
                 req.self.EXPIRES = Number(process.env.EXPIRES);
                 return next();
            } 
            else 
            { 
               /* Invalid password. */

                 return res.status(httpr.bad_request).send({ codes: [protocol.invalid_password] });
             }
        });
    },

    /*
     * ForgotDelete(): Removes an email.
     *
     * @return
     * 
     *         · next(): Model destroyed.
     */

    ForgotDelete: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.email_forgot.destroy({ where: { email: req.body.email }}).then(function (result) 
             {
                  return next();
             });

             return next();
        });
    },

    /*
     * HasForgot(): Checks whether an email has been resetted.
     *
     * @return
     * 
     *         · next(): Switch success.
     */

    HasForgot: async function (req, res, next) 
    {
        return models.email_forgot.findOne({ where: { email: req.body.email }}).then(function (result) 
        {
            if (result != null) 
            {
                return models.email_forgot.destroy({ where: { email: req.body.email }}).then(function (result_destroy) 
                {
                     return next();
                });
            }

            return next();
        });
    },

    /*
     * Forgot(): A new forgot request has been created.
     *                 
     * @return
     * 
     *         · resolve: Created code.
     *         
     * @reject
     *
     *        · protocol.no_exists: User No exists.
     */

    Forgot: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            const rint = etc.makeint(5);

            return models.email_forgot.create({code: rint, email: req.body.email}).then(result => 
            {
                if (result != null) 
                {
                    const subject = "Password reset";
                    data = { code: rint, title: subject };
                    
                    writer.SendMail(req, req.body.email, subject, data, "emails/passwd_reset.ejs");

                    return resolve(protocol.ok);
                }
            });
        });
    },

    /*
     * EmailExists(): Checks whether an email exists in the system.
     *
     * @result
     *
     *         · result: User' data if found.
     *
     * @reject
     *
     *         · missing_param: Email has not been provided.
     *         · bad_format: Email has a bad format.
     */

    EmailExists: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.users.findOne({ where: { email: req.body.email }}).then(result => 
            {
                 if (result != null) 
                 {
                      return resolve(result);
                 } 
                 else 
                 {
                      return reject([protocol.no_exists]);
                 }
            });
        });
    },

    /*
     * RejectInvalidEmail(): Rejects an email if not in the system.
     *                       This reject is unique in a way, as it returns
     *                       a protocol.ok, thus pretending that the forgotten email
     *                       has been found.
     *
     * @reject:
     *
     *        ·  protocol.ok: "Fake" ok result. 
     *
     * @return
     *
     *         · next(): Invalid email.
     */

    RejectInvalidEmail: async function (req, res, next) 
    {
        return models.users.findOne({
            where: {
                email: req.body.email
            }
        }).then(result => {
            if (result == null) {
                return res.status(httpr.ok).send({data: protocol.ok});
            }

            req.self.user = result.id;
            return next();
        });
    },
    /*
     * EmailExistsAsMiddle:(): Middleware that checks whether an email exists in the system.
     *
     * @result
     *
     *         · result: User' data if found.
     *
     * @reject
     *
     *         · bad_format: Email has a bad format.
     */

    EmailExistsAsMiddle: async function (req, res, next) 
    {
        if (req.body.email == req.self.email) 
        {
            return res.status(httpr.bad_request).send({ codes: [protocol.no_change] });
        }

        return models.users.findOne({ where: { email: req.body.email }}).then(result => 
        {
            if (result == null) 
            {
                return next();
            }

            return res.status(httpr.bad_request).send({ codes: [protocol.exists] });
        });
    },

    /*
     * HashPass(): Hashes a given password.
     *
     * @parameters
     *
     *        · body.password: Password to hash.
     *
     * @return
     *
     *         · unknown_error: Unknown error has occured.
     */

    HashPass: async function (req, res, next) 
    {
        return bcrypt.genSalt(10, function (err, salt) 
        {
            return bcrypt.hash(req.body.password, salt, function (error, hash) 
            {
                if (error) 
                {
                    return res.status(httpr.bad_request).send({ codes: [protocol.unknown_error] });
                }

                req.self.hash = hash;
                req.self.salt = salt;

                return next();
            });
        });
    },

    /*
     * Create(): Creates a new user.
     *
     * @parameters
     *
     *        · body.email: Email to register user with.
     *        · self.password: Hashed password.
     *        · body.first: First name.
     *        · body.last: Last name to use.
     *
     * @return
     *
     *         · protocol.operation_failed: Operation failed.
     */

    Create: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                return models.users.create({
                    email: req.body.email,
                    password: req.self.hash
                }, {transaction: trans1}).then(function (result) {
                    return models.user_info.create({
                        userid: result.id,
                        first: req.body.first,
                        last: req.body.last,
                        phone: req.body.phone,
                        salt: req.self.salt,
                        verified: false
                    }, {transaction: trans1}).then(function (result2) {
                        if (result && result.length != 0) {

                   const subject = "Welcome to our store";

                            data = {
                            title: subject,
                                first: req.body.first,
                                code: req.self.new_code,
                                user: result.id,
                            };

                            writer.SendMail(req, req.body.email, subject, data, "emails/welcome.ejs");

                            return result.id;
                        } else {
                            return reject();
                        }
                    });
                });
            }).then(result => {
                 module.exports.CreateCode(req, result);

                return resolve(protocol.ok);
            }).catch(error => {
                return reject([protocol.operation_failed]);
            });
        });
    },

    /*
     * CreateCode(): Creates a code to later use as a verification pool.
     *
     * @parameters
     *
     *         · user: User requesting this new code.
     *
     * @return
     *
     *         · code: Created code.
     *
     * @reject:
     *
     *         · unknown_error: Unknown error has occured.
     *         · exists: Protocol exists.
     */

    CreateCode: async function (req, user) 
    {
        return new Promise((resolve, reject) => 
        {
            var code = etc.makeid(30, 1);

            return models.email_verification.findOne({ where: { code: code }}).then(function (obj) 
            {
                if (obj != null) 
                {
                    return reject([protocol.exists]);
                }
                
                return models.email_verification.create({code: code, userid: user}).then(result => 
                {
                     if (result != null) 
                     {
                         req.self.new_code = code;
                         return resolve(code);
                     } 
                     else 
                     {
                         return reject([protocol.unknown_error]);
                     }
                });
            });
        });
    },

    /*
    * Update(): Updates an user' password.
    * 
    * @parameters
    *        
    *          · body.[all params]: User's password data to udpate.
    * 
    * @resolve
    * 
    *          · protocol.ok: Updated password.
    *
    * @reject
    *
    *          · protocol.error: Unable to update password.
    */

    UpdatePass: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                return models.users.update({ password: req.self.hash }, { where: { id: req.self.user }}, { transaction: trans1 }).then(function (result) 
                { 
                     return models.user_info.update({ salt: req.self.salt }, { where: { userid: req.self.user }}, {transaction: trans1}).then(function (result2) 
                     {
                          /* Whether entries have been modified */
                         
                          if (result && result.length != 0) 
                          {
                              const subject = "Your password has been updated.";

                              var data = 
                              {
                                 title: subject,
                              };
                            
                              writer.SendMail(req, req.self.email, subject, data, "emails/pass_update.ejs");

                              return resolve(protocol.ok);
                          } 
                          else 
                          {
                              return reject([protocol.error]);
                          }
                     });
                });
            })
        });
    },

    /*
    * Update(): Updates an user.
    * 
    * @parameters
    *        
    *          · body.[all params]: User' data to udpate.
    * 
    * @resolve
    * 
    *          · protocol.ok: Updated user.
    *
    * @reject
    *
    *          · protocol.error: Unable to update user.
    */

    Update: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                return models.user_info.update(req.self.params, { where: { userid: req.self.user }}, { transaction: trans1 }).then(function (result) 
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
                
            }).then(result => 
            {
                return resolve(protocol.ok);
                
            }).catch(error => 
            {
                return reject(error);
            });
        });
    },

    /*
     * Info(): Information about a given user.
     * 
     * @parameters
     *        
     *          · body.id: User to retrieve information on.
     * 
     * @return
     *
     *          · error: No user found.
     */

    Info: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.users.findOne({ where: { id: req.body.id }}).then(result => 
            {
                 if (result != null) 
                 {
                     return resolve({user: result});
                 } 
                 else 
                 {
                     return reject([protocol.no_exists]);
                 }
            });
        });
    },

    /*
     * InfoRoles(): Roles information about a given user.
     * 
     * @parameters
     *        
     *          · body.id: User to retrieve information on.
     * 
     * @return
     *
     *          · protocol.no_exists: No user found.
     */

    InfoRoles: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.user_roles.findOne({ where: { userid: req.body.id }}).then(result => 
            {
                if (result != null) {
                    return resolve({roles: result});
                } else {
                    return reject([protocol.no_exists]);
                }
            });
        });
    },

    /*
     * InfoUser(): Extened information about a given user.
     * 
     * @parameters
     *        
     *          · body.id: User to retrieve information on.
     * 
     * @return
     *
     *          · protocol.empty: No user found.
     */

    InfoUser: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.user_info.findOne({ where: { userid: req.body.id }}).then(result => 
             {
                 if (result != null) 
                 {
                     return resolve({info_user: result});
                 } 
                 else 
                 {
                    return reject([protocol.no_exists]);
                 }
             });
        });
    },

    /*
     * LastLogin(): Request information about last login.
     * 
     * @parameters
     *        
     *          · body.id: User to retrieve information on.
     * 
     * @return
     *
     *          · protocol.no_exists: No user found.
     */

    LastLogin: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.query("SELECT * FROM user_logins WHERE userid = ? LIMIT 1", { replacements: [req.self.user], type: models.sequelize.QueryTypes.SELECT }).then(user => 
            {
                if (!user) 
                {
                    return reject([protocol.no_assoc]);
                } 
                else 
                {
                    var data = user[0];
                    return resolve(data);
                }
            });

            return next();
        });
    },

    /* 
     * IDExists(): Checks whether a given user ID exists.
     * 
     * @parameters
     *        
     *          · body.id: User id to check.
     * 
     * @resolve
     * 
     *          · next(): User ID does not exists.
     *
     * @return
     *
     *          · protocol.exists: User ID already defined.
     */

    IDExists: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.users.findOne({ where: { id: req.body.id, active: 1}}).then(result => 
             {
                  if (result != null) 
                  {
                      return next();
                  } 
                  else 
                  {
                      return res.status(httpr.bad_request).send({ codes: [protocol.no_exists] });
                  }
             });
        });
    },

    /* 
     * CountAddresses(): Counts addresses on given user ID.
     * 
     * @parameters
     *        
     *          · body.id: User id to check.
     * 
     * @resolve
     * 
     *          · info_user: User data.
     *
     * @return
     *
     *          · protocol.no_exists: User ID empty.
     */

    CountAddresses: async function (req, res, next) 
    {
         return new Promise((resolve, reject) => 
         {
               return models.address.count({ where: { userid: req.self.target }}).then(result => 
               {
                      if (result != null) 
                      {
                           return resolve({count_address: result});
                      } 
                      else 
                      {
                          return reject([protocol.no_exists]);
                      }
               });
         });
    },

    /* 
     * CountOrders(): Counts orders on given user ID.
     * 
     * @parameters
     *        
     *          · body.id: User id to check.
     * 
     * @resolve
     * 
     *          · orders: Orders' data.
     *
     * @return
     *
     *          · protocol.no_exists: User ID empty.
     */

    CountOrders: async function (req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
             return models.orders.count({ where: { userid: req.self.target }}).then(result => 
             {
                   if (result != null) 
                   {
                       return resolve({count_orders: result});
                   } 
                   else 
                   {
                       return reject([protocol.no_exists]);
                   }
             });
        });
    },

    /*
    * UpdateEmail(): Updates an user's email.
    * 
    * @parameters
    *        
    *          · body.[all params]: User' email.
    * 
    * @resolve
    * 
    *          · protocol.ok: Updated user.
    *
    * @reject
    *
    *          · protocol.error: Unable to update email.
    */

    UpdateEmail: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.sequelize.transaction(trans1 => 
            {
                return models.users.update({ email: req.body.email }, { where: { id: req.self.user }}, {transaction: trans1}).then(function (result) 
                {
                    if (result && result.length != 0) {
                        return resolve(true);
                    } else {
                        return reject([protocol.error]);
                    }
                });
            }).then(result => {
                return resolve(protocol.ok);
            }).catch(error => {
                return reject(error);
            });
        });
    },

    /*
    * List(): Returns all users' list.
    * 
    * @parameters
    *        
    *          · body.[all params]: User' email.
    * 
    * @resolve
    * 
    *          · protocol.ok: Updated user.
    *
    * @reject
    *
    *          · protocol.error: Unable to update email.
    */

    List: async function (req) {
        return new Promise((resolve, reject) => {
            return models.sequelize.query(req.self.query, {
                replacements: {
                    limit: req.self.limit,
                    offset: req.self.offset
                },
                type: models.sequelize.QueryTypes.SELECT
            }).then(results => {
                if (!results) {
                    return reject([protocol.unknown_error]);
                }

                var all = [];

                results.forEach(async (item) => {
                    var adding = {};

                    adding['id'] = item.id;
                    adding['email'] = item.email;
                    adding['first'] = item.first;
                    adding['last'] = item.last;
                    adding['user_created'] = item.user_created;

                    all.push(adding);
                });

                return resolve(all);
            })
        }).catch(function (error) {
            return reject(error);
        });
    },

    /* 
     * CountMonth(): Counts Users registered this month.
     * 
     * @parameters
     *        
     *          · createdat: Users created this month.
     * 
     * @resolve
     * 
     *          · data: Items found.
     *
     * @reject
     *
     *          · no_exists: No items found.
     */

    CountMonth: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            var months = 1;

            if (req.body.months) 
            {
                months = req.body.months;
            }

            return models.sequelize.query("SELECT count(*) as counter FROM `users` WHERE createdat >= (LAST_DAY(NOW()) + INTERVAL 1 DAY - INTERVAL :month MONTH) AND createdat <  (LAST_DAY(NOW()) + INTERVAL 1 DAY);", {
                replacements: {
                    month: months
                },
                type: models.sequelize.QueryTypes.SELECT
            }).then(data => {
                if (!data) {
                    return reject([protocol.no_exists]);
                } else {
                    return resolve(data);
                }
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    /* 
     * CountToday(): Counts Users registered today.
     * 
     * @parameters
     *        
     *          · createdat: Users created today.
     * 
     * @resolve
     * 
     *          · data: Data users.
     *
     */

    CountToday: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            var days = 1;

            if (req.body.days) 
            {
                days = req.body.days;
            }

            return models.sequelize.query("SELECT count(*) as counter FROM `users` WHERE DATE(`createdat`) > (DATE_SUB(CURDATE(), INTERVAL :days DAY))", 
            {
                replacements: 
                {
                    days
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
                    return resolve(data);
                }
            })
            .catch(function (error) 
            {
                return reject(error);
            });
        });
    },

    /* 
     * CheckForgot(): Check if forgot is correct.
     * 
     * @parameters
     *        
     *          · createdat: Users created today.
     * 
     * @resolve
     * 
     *          · data: Data users.
     *
     */

    CheckForgot: async function (req, res, next) 
    {
        return models.email_forgot.findOne({ where: { email: req.body.email }}).then(function (result) 
        {
            if (result == null) 
            {
                return res.status(httpr.bad_request).send({ codes: [protocol.empty] });
            }

            if (req.body.value == result.code) 
            {
                return next();
            }

            return res.status(httpr.bad_request).send({ codes: [protocol.unable_to_log_in] });

        });
    }

}
