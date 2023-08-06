#!/usr/bin/env

const { promises: Fs }  =   require('fs')
const { Table }         =   require('console-table-printer');

async function exists(file) 
{
    path = Path.join(__dirname, file)

    try 
    {
         await Fs.access(path)
         return true
    } 
    catch 
    {
         return false
    }
}

async function initialize(check) 
{
    var server = http.createServer(app);

    await models.sequelize.sync().then(function () 
    {
                format.ok(`${'API server listening on'.padEnd(23)} ${server.address().address}:${server.address().port}`);
    });
}

initialize(true);
