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

var ManagerPayments     =  require('../handlers/manager_payments');

var Promise     =  require('promise');
var protocol    =  require('../run/protocol');
var models      =  require('../databases/sql');
var Settings    =  require('../handlers/settings');
var User        =  require('../handlers/user');
var Roles       =  require('../handlers/roles');
var Collections =  require('../handlers/collections');
var Products    =  require('../handlers/products');
var Variants    =  require('../handlers/variants');
var Address     =  require('../handlers/address');
var Orders      =  require('../handlers/orders');
var Favorites   =  require('../handlers/favorites');
var Status      =  require('../handlers/status');
var format      =  require('../handlers/format');
var Process     =  require('../handlers/process');

module.exports = 
{ 
    /*
     * CheckIfInstalled(): Checks whether an app has been installed
     * 
     * @resolve
     * 
     *          · next(): App never installed.
     *
     * @return
     *
     *          · protocol.operation_failed: App is already installed.
     */

    CheckIfInstalled: async function (req, res, next) 
    {
          return models.settings.findOne({ where: { key: "installed" }}).then(result => 
          {
               if (result == null) 
               {
                    return next();
               }

               return res.status(httpr.bad_request).send({ codes: [protocol.operation_failed] });
          });
    },

    /*
     * FakeSetInsert(): Fakes an insert into the settings' attributes.
     * 
     * @parameter
     *
     *         · key: Defining key.
     *         · value: Defining value.
     *         · public: Whether setting key is public or meant to stay private.
     * 
     * @resolve
     * 
     *          · next(): Operation finished.
     */

    FakeSetInsert: async function (key, value, public = true, is_bool = false) 
    {
        req                =   {};
        req.body           =   {};

        req.body.key       =   key;
        req.body.value     =   value;
        req.body.public    =   public;
        
        req.body.bool      =   is_bool;

        await Settings.Set(req);
    },

    GetSets: async function (req) 
    {
        await module.exports.FakeSetInsert("maint", false, true, true);

        if (req.body.online) 
        {
            await module.exports.FakeSetInsert("online", req.body.online, true, true);
        }
        
        if (req.body.orders) 
        {
            await module.exports.FakeSetInsert("orders", req.body.orders, true, true);
        }
        
        if (req.body.store_name) 
        {
            await module.exports.FakeSetInsert("storename", req.body.store_name);
        }

        if (req.body.lat) 
        {
            await module.exports.FakeSetInsert("lat", req.body.lat);
        }

        if (req.body.lon) 
        {
            await module.exports.FakeSetInsert("lon", req.body.lon);
        }

        if (req.body.contact) 
        {
            await module.exports.FakeSetInsert("contact", req.body.contact);
        }

        if (req.body.orders) 
        {
            await module.exports.FakeSetInsert("orders", req.body.orders, true, true);
        }

        if (req.body.url) 
        {
            await module.exports.FakeSetInsert("url", req.body.url);
        }

        if (req.body.store_address) 
        {
            await module.exports.FakeSetInsert("store_address", req.body.store_address);
        }

        if (req.body.instagram) 
        {
            await module.exports.FakeSetInsert("instagram", req.body.instagram);
        }

        if (req.body.facebook) 
        {
            await module.exports.FakeSetInsert("facebook", req.body.facebook);
        }

        if (req.body.twitter) 
        {
            await module.exports.FakeSetInsert("twitter", req.body.twitter);
        }

        if (req.body.phone) 
        {
            await module.exports.FakeSetInsert("phone", req.body.phone);
        }

        if (req.body.phone_code) 
        {
            await module.exports.FakeSetInsert("phone_code", req.body.phone_code);
        }

        if (req.body.tax) 
        {
            await module.exports.FakeSetInsert("tax", req.body.tax);
        }

        if (req.body.shipping) 
        {
            await module.exports.FakeSetInsert("shipping", req.body.shipping);
        }
        
        if (req.body.base_url)
        {
                await module.exports.FakeSetInsert("base_url", req.body.base_url);
        }
        
       },

       
       FakeFlags: async function (req) 
       {
            req                =   {};
            req.body           =   {};
          
            req.body.id         = 1, 
            req.body.root_flags = true;
        
            await Roles.Upsert(req);
       },
       
       FakeCollections: async function (req) 
       {

            if (req.body.skip == 1)
            {
                  return;
            }

            format.ok("Installing collections");
                     
            req.self           =   {};

            req.self.params    =   { "title": "Pizzeria", "imagesrc": "assets/images/collections/pizza.jpg", "piority": 1 };

            await  Collections.Add(req);

            req.self.params    =   { "title": "Fries", "imagesrc": "assets/images/collections/fries.jpg", "piority": 2 };
            
            await    Collections.Add(req);
            
            req.self.params    =   { "title": "Juices", "imagesrc": "assets/images/collections/juice.jpg", "piority": 3 };
            
            await Collections.Add(req);

            req.self.params    =   { "title": "Seafood", "imagesrc": "assets/images/collections/fish.jpg", "piority": 4 };

            await Collections.Add(req);

            req.self.params    =   { "title": "Salads", "imagesrc": "assets/images/collections/salad.jpg", "piority": 5 };

            await Collections.Add(req);

            req.self.params    =   { "title": "Breakfast", "imagesrc": "assets/images/collections/breakfast.jpg", "piority": 6 };

            await Collections.Add(req);
       
    },

    FakeFavorites: async function(req)
    {
            if (req.body.skip == 1)
            {
                 return;
            }
            
            req.self = {};
            req.self.user = 1;
             
            req.body.id = 1;

            await Favorites.Add(req);

            req.body.id = 2;

            await Favorites.Add(req);

            req.body.id =  3;

            await  Favorites.Add(req);
    },
    
    FakeAddress: async function(req)
    {
            if (req.body.skip == 1)
            {
                 return;
            }
            
            req.self = {};
            
            req.self.user = 1;
            req.body.name = "Home";
            req.self.params = { "userid": 1, "options": "Deliver before 6pm", "name": "Home", "zip": 939, "address": "742 Evergreen Terrace", "city": "Springfield", "commentary": "Beware of the dog!", "aptsuite": 1 };
            
            await Address.Add(req);

            req.body.name = "Office";
            req.self.params = { "userid": 1, "options": "Deliver in the front door", "name": "Office", "zip": 1000, "address": "100 Industrial way", "city": "Springfield", "commentary": "Beware of reactors' failures", "aptsuite": 20 };

            await  Address.Add(req);
    },
    
    FakeProducts: async function(req)
    {
            if (req.body.skip == 1)
            {
                  return;
            }
            
           req.body.name      =   "cash"; 
           req.body.global    =   true;
           req.body.icon      =   "cash"
           
            await ManagerPayments.Add(req);
            
            format.ok("Adding products");

            req.self = {};

            req.self.params    = { "rank": 1, "description": "Get your healthy bananas!", "name": "Banana", "imagesrc": "assets/images/variants/banana.jpg", "title": "Ecuatorian bananas", "stock": -1, "collection": 6, "price": 3.99, "type": "unique", "default_variant": 1};

            await   Products.SimpleAdd(req);

            req.self.params    = { "rank": 2, "description": "Start your day with cereals!", "name": "Cereal", "imagesrc": "assets/images/variants/cereal.jpg", "title": "Cereal", "stock": -1, "collection": 6, "price": 7.99, "type": "unique", "default_variant": 2};

            await   Products.SimpleAdd(req);
            
            req.self.params = { "rank": 3, "description": "Fresh yogurt cannot go wrong.", "name": "Yogurt", "imagesrc": "assets/images/variants/yogurt.jpg", "title": "Vanilla Yogurt", "stock": -1, "collection": 6, "price": 6.99, "type": "unique", "default_variant": 3 };

            await  Products.SimpleAdd(req);
            
            req.self.params = { "rank": 4, "description": "Homemade style pasta", "name": "Pasta", "imagesrc": "assets/images/variants/pasta.jpg", "title": "Italian Pasta", "stock": -1, "collection": 1, "price": 16.99, "type": "unique", "default_variant": 4 };

            await  Products.SimpleAdd(req);
            
            req.self.params = { "rank": 5, "description": "Tasty Apple Juice!", "name": "Apple Juice", "imagesrc": "assets/images/variants/apple.jpg", "title": "Flutter juices", "stock": -1, "collection": 3, "price": 4.99, "type": "unique", "default_variant": 5 };

            await  Products.SimpleAdd(req);
           
            req.self.params = { "rank": 6, "description": "Get your cheese Hamburgers now!", "name": "Hamburger", "imagesrc": "assets/images/variants/hamburger.jpg", "title": "Buffalo Steak", "stock": -1, "collection": 2, "price": 22.99, "type": "unique", "default_variant": 6 };

            await  Products.SimpleAdd(req);
            
            req.self.params = { "rank": 7, "description": "Elevate your everyday essentials!", "name": "Pancakes", "imagesrc": "assets/images/variants/pancake.jpg", "title": "Pancakes", "stock": -1, "collection": 6, "price": 32.20, "type": "unique", "default_variant": 7 };

            await  Products.SimpleAdd(req);
            
            req.self.params = { "rank": 8, "description": "Imported from Mexico", "name": "Avocado Salad", "imagesrc": "assets/images/variants/avocado_salad.jpg", "title": "Avocado Salad", "stock": -1, "collection": 5, "price": 13.20, "type": "unique", "default_variant": 8};

            await  Products.SimpleAdd(req);

            req.self.params = { "rank": 9, "description": "Fresh Peruvian-style Burritos", "name": "Burritos", "imagesrc": "assets/images/variants/burritos.jpg", "title": "Burritos", "stock": -1, "collection": 6, "price": 15.20, "type": "unique", "default_variant": 9};

            await  Products.SimpleAdd(req);

            req.self.params = { "rank": 10, "description": "Get your omega3-rich fish!", "name": "Fish", "collection": 4, "type": "dropdown", "image": "assets/images/variants/peruvian-fish.jpg", "default_variant": 10};

            await  Products.Add(req);

            req.self.params = { "product": 10, "price": 12.33, "title": "Peruvian fish", "stock": -1, "default_variant": 10 };

            await  Variants.Add(req);

            req.self.params = { "product": 10,  "price": 32.33, "title": "Californian fish", "stock": -1, "default_variant": 10 };

            await  Variants.Add(req);

            req.body.image = "assets/images/variants/banana2.jpg";
            req.body.id = 1;
            req.body.rank = 1;

            await  Variants.AddImage(req);

            req.body.image = "assets/images/variants/banana3.jpg";
            req.body.id = 1;
            req.body.rank = 2;
            
            await  Variants.AddImage(req);

            req.body.image = "assets/images/variants/peruvian-fish.jpg";
            req.body.id = 10;

            await  Variants.AddImage(req);
            
            req.body.image = "assets/images/variants/california-fish.jpg";
            req.body.id = 11;

            await  Variants.AddImage(req);
            
           
       },
       

    /*
     * Setup(): Configures a new instance of CazuApp.
     * 
     * @parameters
     *        
     *          · [user data, setting data]: All required parameters to install CazuApp.
     * 
     * @return
     *
     *          · error: App most likely is already installed.
     */

    Setup: async function (req) 
    {
         return new Promise(async(resolve, reject) => 
         {
             await module.exports.FakeSetInsert("installed", true, false);
             await module.exports.GetSets(req);
             await User.Create(req);

             await module.exports.FakeCollections(req);

             await module.exports.FakeProducts(req);
             await module.exports.FakeAddress(req);
             await module.exports.FakeFavorites(req);
             
             await module.exports.FakeFlags(req); 
             

             return resolve(protocol.ok);
         });
    }
}
