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
var etc         =  require('../handlers/etc');

module.exports = 
{
    /*
     * Confirm(): Confirms an user' registration.
     *
     * @return
     *
     *         · protocol.no_assoc: No association found.
     */

    Confirm: async function (req) 
    {
        return new Promise((resolve, reject) => 
        {
            if (!req.params.code) 
            {
                  return res.status(httpr.bad_request).send({ codes: [protocol.missing_param] });
            }

            return models.sequelize.transaction(trans1 => 
            {
                return models.email_verification.findOne({ where: { code: req.params.code, userid: req.params.user }}, { transaction: trans1 }).then(function (eresult) 
                {
                    if (!eresult) 
                    {
                        return reject([protocol.no_assoc]);
                    }

                    return models.user_info.update({ verified: true }, { where: { userid: eresult.userid }}, { transaction: trans1 }).then(function (eresultx) 
                    {	
                            return models.user_info.findOne({ where: { userid: eresult.userid }}, { transaction: trans1 }).then(function (eresultx2) 
                            {   
                                    req.self.first = eresultx2.first;
                        
                                    return models.email_verification.destroy({ where: { code: req.params.code }}, {transaction: trans1}).then(function (eresult2) 
                                    {
                                             return eresult.id;
                                    });
                            });
                    });
                });
                
            }).then(result => 
            {
                 return resolve(protocol.ok);
            })
            .catch(err => 
            {
            console.log(err);
                 return reject(err);
            });
        });
    }

}
