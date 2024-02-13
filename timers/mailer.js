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

var Bull      = require('bull');
var Transport = require('../config/mailer.js');
var emailconf = require('../run/email');

module.exports = 
{
   /*
    * Flush(): Sends an email on the backend.
    *          This function adds a new job to a 
    *          redis server and then delivers it.
    */

    Flush: async function(to, subject, content) 
    {
        if (content == null || content == "0") 
        {
            return;
        }

        const Queue = new Bull('mailqueue');

        const job = await Queue.add({ mail: to, subject: subject, content: content }, { fifo: true });

        Queue.process(async (job, done) => 
        {
            var mailOptions = 
            {
                from: emailconf.EMAIL_ORIGIN,
                to: job.data.mail,
                subject: job.data.subject,
                html: job.data.content
            }

            Transport().sendMail(mailOptions, function (error, info) 
            {
                  if (error) 
                  {
                      console.log(error);
                  } 
                  else 
                  {
                      console.log('Email sent: ' + info.response);
                  }
                  
            });
            
            done();
        })
    }
}
