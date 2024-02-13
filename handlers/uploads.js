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
var httpr       =  require('../run/httpr');
var protocol    =  require('../run/protocol');
var models      =  require('../databases/sql');
var etc         =  require('../handlers/etc');
var format      =  require('../handlers/format');
var writer      =  require('../handlers/writer');
var Collections =  require('../handlers/collections');
var Variants    =  require('../handlers/variants');

const path     =  require("path");
const fs       =  require("fs");

module.exports = 
{
    /*
     * Submit(): Uploads a file.
     * 
     * @parameters:
     *            
     *           - req - The request object containing file information.
     *        
     * 
     * @resolve:
     *
     *           - Resolves with a success message if the file is successfully uploaded.
     * 
     *
     * @reject:
     *
     *          - {Array|string} - Rejects with an array of error codes or a string describing the error.
     *
     */
    
    Submit: async function(req)
    {
          return new Promise((resolve, reject) => 
          {
                  if (!req.body.id)
                  {
                        return reject([protocol.missing_id]);
                  }

                  var dest = "";
                  
                  if (!req.body.type || req.body.type == "variants")
                  {
                        dest = "variants/";   
                  }
                  else if (req.body.type == "collections")
                  {
                       dest = "collections/";
                  }
                  else
                  {
                       dest = "variants/";
                  }
                  
                  var ext = path.extname(req.file.originalname).toLowerCase();
                  var random = etc.makeid(10) + "-" + etc.makeid(5);
                  var loop = true;
                  var core = "assets/images/";

                  var targetPath = "";
                  var sqlpath = "";
                  
                  (async() => 
                  {
                       while (loop)
                       { 
                             targetPath = path.join(__dirname, "../" + core) + dest + random + ext;
                             sqlpath = core + dest + random + ext;

                             try 
                             {
                                  await fs.access(targetPath)
                                  loop = true;
                             }  
                             catch 
                             {
                                loop = false;
                             }
                    }
                  
                  })();
                  
                  const tempPath = req.file.path;

                  if (ext === ".png" || ext === ".jpeg" || ext === ".jpg") 
                  {
                          fs.rename(tempPath, targetPath, error => 
                          {
                                 if (error) 
                                 {
                                     return reject([protocol.operation_failed]);
                                 }

                             (async() => 
                             {
                                 /* Collections' imagesrc update */
                                 
                                 if (req.body.type == "collections")
                                 {
                                     try 
                                     {
                                         req.self.params = { "imagesrc": sqlpath };
                                         var result = await Collections.Update(req);
                                     } 
                                     catch (error) 
                                     {
                                         return reject([protocol.operation_failed]);
                                     }
                                     
                                 }
                                 else 
                                 {
                                     try 
                                     {
                                         req.body.image = sqlpath;
                                         var result = await Variants.AddImage(req);
                                     } 
                                     catch (error) 
                                     {
                                         return reject([protocol.operation_failed]);
                                     }
                                 
                                 }
                               
                                 return resolve(protocol.ok);
                             
                             })();
                                 
                          });
                  } 
                  else
                  {
                          fs.unlink(tempPath, error => 
                          {
                                 if (error)
                                 {
                                 console.log(error);
                                    //return handleError(error, res);
                                 }
                                 
                                 return reject([protocol.invalid_ext]);
                          });
                  }
          });
    },
    
}
