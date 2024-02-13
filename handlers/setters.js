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

var Promise     =  require('promise');
var protocol    =  require('../run/protocol');
var models      =  require('../databases/sql');
var ValidCord   =  require('is-valid-coordinates');
var format      =  require('../handlers/format');
var User        =  require('../handlers/user');
var Streams     =  require('../handlers/streams');

module.exports = 
{
    /*
     * SetLogin(): Sets Login information on an user.
     * 
     * @reject
     *
     *          · protocol.no_items: No data found.
     */

    SetLogin: async function (req, res, next) 
    {
        return new Promise((resolve, reject) =>
        {
             if (req.self.is_target == 1)
             {
                  return next();
             }
             
             return models.sequelize.transaction(trans1 =>
             {
                     return models.user_logins.findOne({ where: { userid: req.self.user }}, { transaction: trans1 }).then(function(result)
                     {
                              Streams.KeepLast(req.self.user);

                              if (result)
                              {
                                     return  models.user_logins.update({ ip: req.self.ip, browser: req.useragent.browser, version: req.useragent.version, os: req.useragent.os, source: req.useragent.source }, { where: { userid: req.self.user }}, { transaction: trans1 }).then(function(result2)
                                     {
                                           return resolve(protocol.ok);
                                     });
                              }
                                    
                              return models.user_logins.create({ userid: req.self.user, ip: req.self.ip, browser: req.useragent.browser, version: req.useragent.version, os: req.useragent.os, source: req.useragent.source  }, { transaction: trans1 }).then(function(result2)
                              {
                                     return resolve(protocol.ok);
                              });
                     });
             })
             .then(result => 
             {
                    return next();
             })
             .catch (error => 
             {
                    return next();
             });
        }); 
        
        return next();
    },

    /*
     * IsOverride(): Checks whether a request is an override.
     * 
     * @resolve
     *
     *          · next(): Middleware passed.
     */

    IsOverride: async function (req, res, next)
    {
        return new Promise((resolve, reject) => 
        {
             const override      =  req.headers["over"];
           
             if (typeof override !== 'undefined') 
             {
                    const target =  Number(override);

                    return models.users.findOne({ where: { id: target, active: 1 }}).then(result =>
                    {
                           if (!result)
                           {
                                 return res.status(httpr.bad_request).send({ codes: [protocol.no_target] });
                           }
                                 
                           req.origin.user    =  req.self.user;
                           
                           req.origin.email = req.self.email;
                           req.origin.first = req.self.first;
                           req.origin.last = req.self.last;
                           req.origin.verified = req.self.verified;
                           req.origin.phone = req.self.phone;
                           
                           req.self.user      =  target;
                           req.self.is_target =  true;
                                 
                           return next();
                    });
             }
             
             return next();
             
         });
    }, 

    /*
     * SetData(): Sets data on a given user.
     * 
     * @parameters
     *        
     *          · self.is_target: Target user.
     * 
     * @resolve
     * 
     *          · next(): This function will resolve by calling the 'next' middleware function.
     */    
     
    SetData: async function (req, res, next)
    {
        return new Promise((resolve, reject) =>
        {
                if (req.self.is_target == 1)
                {
                    return next();
                }

                var Startup   =  req.headers["startup"];
                var Device    =  req.headers["device"];

                if (typeof Startup !== 'undefined' && typeof Device !== 'undefined') 
                {
                       /* Add your own componenets */
                    
                       return next();
                }
                
                return next();
        });
    },
    
    /*
     * SetLocation(): Sets location on an user.
     * 
     * @reject
     *
     *          · protocol.no_items: No data found.
     */

    SetLocation: async function (req, res, next) 
    {
        return new Promise((resolve, reject) =>
        {
                if (req.self.is_target == 1)
                {
                    return next();
                }
                
                var Latitude = req.headers["lat"];
                var Long     = req.headers["lon"];

                if (typeof Latitude !== 'undefined' && typeof Long !== 'undefined') 
                {
                        Latitude = Number(req.headers["lat"]);
                        Long     = Number(req.headers["lon"]);
                        
                        if (ValidCord(Long, Latitude) == false)
                        {
                                  format.error(`Invalid: Latitude: ${Latitude} | Longitude: ${Long}`);
                                  return next();
                        }

                        //format.ok(`Latitude: ${Latitude} | Longitude: ${Long}`);
                        
                        return models.sequelize.transaction(trans1 =>
                        {
                                    return models.user_locations.findOne({ where: { userid: req.self.user }}, { transaction: trans1 }).then(function(result)
                                    {
                                            if (result)
                                            {
                                                    return models.user_locations.update({ lat: Latitude, lon: Long }, { where: { userid: req.self.user }}, { transaction: trans1 }).then(function(result2)
                                                    {
                                                          return resolve(protocol.ok);
                                                    });
                                            }
                                            else
                                            {
                                                    return models.user_locations.create({ userid: req.self.user, lat: Latitude, lon: Long }, { transaction: trans1 }).then(function(result2)
                                                    {
                                                            return resolve(protocol.ok);
                                                    });
                                            }
                                    });
                        })
                        .then(result => 
                        {
                                return next();
                        })
                        .catch (error => 
                        {
                                return next();
                        });
                }
                
                return next();
        });
    },
}