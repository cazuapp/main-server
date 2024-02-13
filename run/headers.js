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

const dotenv = require('dotenv');
const ParseVars = require('dotenv-parse-variables');

let env = dotenv.config({path: '.headers'})

if (env.error) 
{
    throw env.error;
}

headers = ParseVars(env.parsed);

module.exports = headers;
