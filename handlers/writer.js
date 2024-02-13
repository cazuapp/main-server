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

var Promise   =   require('promise');
var ejs       =   require('ejs');
var Mailer    =   require('../timers/mailer');
var etc       =   require('../handlers/etc');

module.exports = 
{   
    /*
     * SendMail(): Sends a mail.
     *
     * @resolve
     *
     *         · email: Destination email.
     *         · subject: Emails' subject.
     *         · data: Data to parse.
     *         · file: Email template.
     *
     * @resolve
     *
     *         · error: Error while sending email.
     */

    SendMail: async function (req, email, subject, data, file) 
    {
        if (process.env.NODE_ENV != "production") 
        {
              return;
        }
        
        data = etc.web_basics(req, data);

        return module.exports.Render(file, data).then(function (result) 
        {
               return Mailer.Flush(email, subject, result).then(function (result2) 
               {
                    return true;
               })
               .catch(function (error) 
               {
                    return false;
               });
        });
    },
    
    /*
     * Render(): Renders an email.
     *
     * @resolve
     *
     *         · str: Renderized html content.
     *
     * @resolve
     *
     *         · error: Error while rendering email.
     */
    
    Render: async function (filename, data, options) 
    {
          return new Promise((resolve, reject) => 
          {
               return ejs.renderFile(filename, data, options, function (err, str) 
               {
                    if (!err) 
                    {
                        return resolve(str);
                    }

                    return reject(err);
               });
          });
    }
}
