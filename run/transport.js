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

var winston = require('winston');
require('winston-daily-rotate-file');

const Transport = require('winston-transport');
const util = require('util');
const Logs = require('../handlers/logger');
var format   =  require('../handlers/format');

class Flusher extends Transport 
{
    constructor(opts) 
    {
        super(opts);
    }

    log(info, callback) 
    {
        Logs.Log(info[Symbol.for('message') ],
            info[Symbol.for('splat') ][0]);

                setImmediate(() => {
                    this.emit('logged', info);
                });

                callback();
            }};


        var error = new winston.transports.DailyRotateFile({
            filename: 'logs/errors-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '5d',
            level: 'error'
        });

        var access = new winston.transports.DailyRotateFile({
            filename: 'logs/access-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '4d',
            level: 'info'
        });

        access.on('rotate', function (oldFilename, newFilename) 
        {
                format.ok("Rotating log file: ${oldFilename} to ${newFilename}`");
                Logs.Log(info[Symbol.for('message') ], "Rotating log file: ${oldFilename} to ${newFilename}`");
                }
            );

            const FlushCustom = new Flusher({});

            var myFormat = winston.format.combine(winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}), winston.format.printf((info) => {
 //                return '[' + info.timestamp + '] ' + info.message["headers"]["host"] + ' ' + info.message["headers"]["user-agent"] + ' (' + info.message["url"] + ')';
                return '[' + info.timestamp + '] ' + JSON.stringify({level: info.level, message: info.message});
            }));

            var logger = winston.createLogger({

                format: myFormat,
                transports: [access, error, FlushCustom]
            });


module.exports = logger;
