#!/usr/bin/env

const { promises: Fs }  =   require('fs')
const { Table }         =   require('console-table-printer');

async function initialize(check) 
{
    await models.sequelize.sync().then(function () 
    {
    
    });
}

initialize(true);
