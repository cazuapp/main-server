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
    Queue: async function() 
    {
        const Deliver = new Bull('undeliveredqueue');

        const job = await Deliver.add({ job: 'undeliveredlist' }, { repeat: { every: 500000 }});

        Deliver.process(async (job, done) => 
        {
              await models.order_status.update({ status: "other", code: 1 }, { where: { status: "pending", createdat: { [models.Sequelize.Op.lte]: new Date(Date.now() - (60*60*24*1000)) }}});
              done();
        })

    }
}
