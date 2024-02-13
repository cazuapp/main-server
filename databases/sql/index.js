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

'use strict';

var fs          =   require('fs');
var path        =   require('path');
var Sequelize   =   require('sequelize');
var basename    =   path.basename(__filename);
var env         =   process.env.NODE_ENV || 'development';
var config      =   require(__dirname + '/../../config/config.js')[env];
var db          =   {};

if (config.use_env_variable) 
{
    var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} 
else
{
    var sequelize = new Sequelize(config.database, config.username, config.password, config);
} 
fs.readdirSync(__dirname).filter(file => 
{
    return(file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
})
.forEach(file => 
{
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model;
});

Object.keys(db).forEach(modelName => 
{
    if (db[modelName].associate) 
    {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
