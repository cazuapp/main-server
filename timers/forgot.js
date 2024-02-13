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

var Bull     =  require('bull');
var models   =  require('../databases/sql');

module.exports = 
{
    /* Removes unused forgotten email requests */
    
    Queue: async function() 
    {
        const Forgot = new Bull('forgotqueue');

        const job = await Forgot.add({ job: 'cycle' }, { repeat: { every: 500000 }});

        Forgot.process(async (job, done) => 
        {
              await models.email_forgot.destroy({  where: { createdat: { [models.Sequelize.Op.lte]: new Date(Date.now() - (60*60*24*1000)) }} });
              done();
        })

    }
}
