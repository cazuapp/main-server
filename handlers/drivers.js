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

var Promise           =  require('promise');
var httpr             =  require('../run/httpr');
var protocol          =  require('../run/protocol');
var models            =  require('../databases/sql');
var etc               =  require('../handlers/etc');

module.exports = 
{
    /*
     * Assign(): Assigns a new order
     *
     * @parameters
     *
     *          · body.orderid: Order to take.
     *
     * @resolve
     *
     *          · protocol.ok:
     *
     * @reject
     *
     *          · protocol.empty: Empty seat.
     */

    Assign: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
             return models.sequelize.transaction((trans1) =>
             {
                    return models.order_deliver.findOne({ where: { orderid: req.body.id, status: "ready" }}, { transaction: trans1 }).then((taken) =>
                    {
                            /* Check whether order has been assigned to somebody else */
                            
                            if (taken != null)
                            {
                                return reject([protocol.busy]);
                            }

                            return models.order_deliver.update({ driver: req.body.user }, { where: { orderid: req.body.id }},
                            {
                                    transaction: trans1
                            })
                            .then(function(result)
                            {
                                   if (result && result.length != 0)
                                   {
                                        return 1;
                                   }
                                   else
                                   {
                                        return reject([protocol.empty]);
                                   }
                            });
                    });
             })
             .then((result) =>
             {
                  return resolve(protocol.ok);
             })
             .catch((error) =>
             {
                  return reject(error);
             });
        });
    },

    /*
     * OrderGetMine(): Retrieves order status information based on provided parameters.
     *
     * @params
     *
     *        · [req.body.param]: Status parameter (all, ok, pending, nopayment, nodriver, cancelled, other).
     *        · [req.body.date_start]: Start date for filtering orders.
     *        · [req.body.date_end]: End date for filtering orders.
     *
     * @resolve
     *
     *        · [results]: Fetched order status information.
     *
     * @reject
     *
     *        · [protocol.empty]: No results found.
     *
     */

    OrderGetMine: async function(req, res, next)
    {
        return new Promise((resolve, reject) =>
        {
            var query = "";

            /* Check if a specific status parameter is provided, otherwise retrieve all statuses */

            if (!req.body.param || req.body.param == "all")
            {
                query = ' order_status.status IN ("ok", "pending", "nopayment", "nodriver", "cancelled", "other")';
            }
            else
            {
                query = ' order_status.status IN ("' + req.body.param + '")';
            }

            /* Initialize date string for filtering by date range */

            var date = "";

            if (req.body.date_start != 0 && req.body.date_end != 0)
            {
                date = " AND order_status.createdat BETWEEN '" + req.body.date_start + " 00:00:00' AND '" + req.body.date_end + " 23:59:59'";
            }

            /* Use Sequelize to execute a raw SQL query to fetch relevant order status information */

            return models.sequelize.query(
                    "SELECT order_status.status AS order_status, order_record.*, order_deliver.*, orders.* FROM order_status " +
                    "INNER JOIN order_record ON order_record.orderid = order_status.orderid " +
                    "INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid " +
                    "INNER JOIN orders ON order_status.orderid = orders.id " +
                    "WHERE " + query + date + " and order_deliver.driver = :user LIMIT :limit OFFSET :offset",
                    {
                        replacements:
                        {
                            query: query,
                            user: req.self.user,
                            status: req.body.param,
                            limit: req.self.limit,
                            offset: req.self.offset,
                        },

                        type: models.sequelize.QueryTypes.SELECT,
                    }
                )
                .then((results) =>
                {
                    /* Check if any results were returned, if not, reject with an empty result error. */

                    if (!results || results.length == 0)
                    {
                        return reject([protocol.empty]);
                    }

                    /* Resolve the promise with the fetched results */

                    return resolve(results);
                })
                .catch(function(error)
                {
                    /* Reject the promise if there is an error during the query execution */

                    return reject(error);
                });
        });
    },

    /*
     * Search(): Search for drivers based on the search query.
     *
     * @params
     *
     *        · [req.body.value]: Search query.
     *
     * @resolve
     *
     *        · [results]: Matching drivers found.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to search for drivers.
     *
     */

    Search: async function(req, res, next)
    {
         return new Promise((resolve, reject) =>
         {
                return models.sequelize.query("SELECT drivers.userid as id, drivers.createdat as created, user_info.first, user_info.last, users.email FROM drivers JOIN users ON drivers.userid = users.id JOIN user_info ON drivers.userid = user_info.userid WHERE user_info.first LIKE :search_query OR users.email LIKE :search_query OR user_info.last LIKE :search_query LIMIT :limit OFFSET :offset",
                {
                    replacements:
                    {
                        search_query: req.body.value,
                        limit: req.self.limit,
                        offset: req.self.offset
                    },

                    type: models.sequelize.QueryTypes.SELECT,
                })
                .then((results) =>
                {
                    if (!results || results.length === 0)
                    {
                        return reject([protocol.empty]);
                    }

                    return resolve(results);
                })
                .catch(function(error)
                {
                    return reject(error);
                });
         });
    },

    /*
     * GetAll(): Retrieve all drivers with user information.
     *
     * @resolve
     *
     *        · [results]: All drivers with user information found.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to fetch drivers.
     *
     */

    GetAll: async function(req, res, next)
    {
        return new Promise((resolve, reject) =>
        {
              return models.sequelize.query("SELECT drivers.userid as id, drivers.createdat as created, user_info.first, user_info.last, users.email, drivers.available FROM drivers JOIN users ON drivers.userid = users.id JOIN user_info ON drivers.userid = user_info.userid LIMIT :limit OFFSET :offset;",
              {
                    replacements:
                    {
                        limit: req.self.limit,
                        offset: req.self.offset,
                    },

                    type: models.sequelize.QueryTypes.SELECT,

              }).then((results) =>
              {
                    if (!results || results.length === 0)
                    {
                        return reject([protocol.empty]);
                    }

                    return resolve(results);
              })
              .catch(function(error)
              {
                    return reject(error);
              });
        });
    },

    /*
     * OrderGet(): Retrieves orders based on search criteria.
     * 
     * @parameters
     *        
     *   · req.self.user: User object (required)
     *   · req.body.param: Parameter to determine the type of orders to retrieve ("all" or other, default: "all")
     *   · req.body.status: Order status
     *   · req.self.limit: Limit for pagination
     *   · req.self.offset: Offset for pagination
     * 
     * @resolve
     * 
     *   · [result]: Order list.
     *
     * @return
     *
     *   · protocol.no_exists: No orders found.
     */

     OrderGet: async function(req, res, next) 
     {
         return new Promise((resolve, reject) => 
         {
                if (!req.body.param) 
                {
                    req.body.param = "all";
                }

                const queryCondition = req.body.param === "all" ? "" : `AND order_deliver.driver = ${req.self.user}`;

                return models.sequelize.transaction(trans => 
                {
                    const queryString = `SELECT * FROM order_status 
                    INNER JOIN order_record ON order_record.orderid = order_status.orderid 
                    INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid 
                    INNER JOIN orders ON order_status.orderid = orders.id 
                    WHERE order_status.status = :status ${queryCondition} 
                    LIMIT :limit OFFSET :offset`;

                    return models.sequelize.query(queryString, 
                    {
                        replacements: 
                        {
                            user: req.self.user,
                            status: req.body.status,
                            limit: req.self.limit,
                            offset: req.self.offset,
                        },
                        
                        type: models.sequelize.QueryTypes.SELECT,
                        transaction: trans,
                })
                .then((results) => 
                {
                    if (!results || results.length === 0) 
                    {
                        req.self.counter = 0; 
                        return reject([protocol.empty]);
                    }

                    /* Perform a transaction query to count the items found */
                    
                    return models.sequelize.query(`SELECT COUNT(*) as counter FROM order_status 
                        INNER JOIN order_record ON order_record.orderid = order_status.orderid 
                        INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid 
                        INNER JOIN orders ON order_status.orderid = orders.id 
                        WHERE order_status.status = :status ${queryCondition}`,
                        {
                            replacements: 
                            {
                                user: req.self.user,
                                status: req.body.status,
                            },
                    
                            type: models.sequelize.QueryTypes.SELECT,
                            transaction: trans,
                        })
                        .then(counter => 
                        {
                            req.self.counter = counter[0]["counter"];
                            return resolve(results);
                        });
                })
                .catch(function(error) 
                {
                    return reject(error);
                });
           });
      });
   },

    /*
     * OrderSearch(): Retrieves orders based on search criteria.
     * 
     * @parameters
     *        
     *   · req.self.user: User object (optional)
     *   · req.body.value: Search value
     *   · req.body.status: Order status (default: "pending")
     *   · req.self.limit: Limit for pagination
     *   · req.self.offset: Offset for pagination
     * 
     * @resolve
     * 
     *   · [result]: Order list.
     *
     * @return
     *
     *   · protocol.no_exists: No orders found.
     */

    OrderSearch: async function(req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            if (!req.body.status) 
            {
                req.body.status = "pending";
            }

            return models.sequelize.transaction(trans => 
            {
                const queryCondition = req.body.param != "all" ? `AND (order_deliver.driver = ${req.self.user})` : "";
                const queryString = `SELECT * FROM order_status 
                    INNER JOIN order_record ON order_record.orderid = order_status.orderid 
                    INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid 
                    INNER JOIN orders ON order_status.orderid = orders.id 
                    WHERE (order_record.address_address LIKE :query OR order_record.address_city LIKE :query) 
                    AND order_status.status = :status ${queryCondition} 
                    LIMIT :limit OFFSET :offset`;

                return models.sequelize.query(queryString,
                {
                        replacements: 
                        {
                            query: `%${req.body.value}%`, // assuming you want to match anywhere in the address
                            user: req.self.user,
                            status: req.body.status,
                            limit: req.self.limit,
                            offset: req.self.offset,
                        },

                        type: models.sequelize.QueryTypes.SELECT,
                        transaction: trans,
                    })
                    .then((results) => 
                    {
                        if (!results || results.length === 0) 
                        {
                        
                            /* Set req.self.counter to 0 when no results are found */
                            req.self.counter = 0;
                            return reject([protocol.empty]);
                        }

                        /* Perform a transaction query to count the items found */
                        
                        return models.sequelize.query(`SELECT COUNT(*) as counter FROM order_status 
                            INNER JOIN order_record ON order_record.orderid = order_status.orderid 
                            INNER JOIN order_deliver ON order_status.orderid = order_deliver.orderid 
                            INNER JOIN orders ON order_status.orderid = orders.id 
                            WHERE (order_record.address_address LIKE :query OR order_record.address_city LIKE :query) 
                            AND order_status.status = :status ${queryCondition}`,
                            {
                                replacements: 
                                {
                                    query: `%${req.body.value}%`,
                                    user: req.self.user,
                                    status: req.body.status,
                                },
                                
                                type: models.sequelize.QueryTypes.SELECT,
                                transaction: trans,
                            })
                            .then(counter => 
                            {
                                req.self.counter = counter[0]["counter"];
                                return resolve(results);
                            });
                })
                .catch(function(error) 
                {
                      return reject(error);
                });
            });
        });
    },

    /*
     * OrderStats(): Fetches order statistics based on specified parameters.
     *
     * @parameters
     *
     *   · body.date_start: Start date for filtering (optional).
     *   · body.date_end: End date for filtering (optional).
     *
     * @resolve
     *
     *   · Object: Order statistics formatted as { status: status_count }.
     *
     * @reject
     *   · [protocol.empty]: No order statistics found.
     *   · [protocol.error]: An error occurred during the process.
     */

    OrderStats: async function(req, res, next) 
    {
        return new Promise((resolve, reject) => 
        {
            var date = "";

            /* Check if date_start and date_end are provided */

            if (req.body.date_start != 0 && req.body.date_end != 0) 
            {
                date = "AND (os.createdat BETWEEN '" + req.body.date_start + " 00:00:00' AND '" + req.body.date_end + " 23:59:59') ";
            }

            /* Execute Sequelize query to get order statistics */

            return models.sequelize.query(
                "SELECT all_statuses.status, COALESCE(status_counts.status_count, 0) AS status_count FROM(SELECT os.status, COUNT(*) AS status_count FROM order_status os INNER JOIN order_deliver od ON os.orderid = od.orderid WHERE od.driver = :user " + date + " GROUP BY os.status) AS status_counts RIGHT JOIN(SELECT DISTINCT status FROM order_status) AS all_statuses ON status_counts.status = all_statuses.status LIMIT :limit OFFSET :offset",
                {
                    replacements: 
                    {
                        user: req.self.user,
                        limit: req.self.limit,
                        offset: req.self.offset,
                    },

                    type: models.sequelize.QueryTypes.SELECT,
                }
            )
            .then((results) => 
            {
                if (!results || results.length == 0) 
                {
                    return reject([protocol.empty]);
                }

                var format = {};

                Object.keys(results).map(function(key) 
                {
                    format[results[key]["status"]] = results[key]["status_count"];
                });

                return resolve(format);
            })
            .catch(function(error) 
            {
                return reject([protocol.error]);
            });
        });
    },

    /*
     * Unassign(): Unassigns a driver from a specific order.
     *
     * @parameters:
     *
     *   · body.id: Order ID to unassign the driver from.
     *
     * @resolve:
     *
     *   · protocol.ok: Driver successfully unassigned.
     *
     * @reject:
     *
     *   · [protocol.empty]: No records found for the provided order ID.
     *   · [protocol.error]: An error occurred during the process.
     */

    Unassign: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
              return models.sequelize.transaction((trans1) =>
              {
                     return models.order_deliver.findOne({ where: { orderid: req.body.id }}, { transaction: trans1 }).then((taken) =>
                     {
                            /* Updates order by updating driver to 'null' */
                            
                            return models.order_deliver.update({ driver: null }, { where: { orderid: req.body.id }}, { transaction: trans1 }).then(function(result)
                            {
                                    if (result && result.length != 0)
                                    {
                                        return 1;
                                    }
                                    else
                                    {
                                        return reject([protocol.empty]);
                                    }
                            });
                      });
              })
              .then((result) =>
              {
                    return resolve(protocol.ok);
              })
              .catch((error) =>
              {
                    return reject(error);
              });
        });
    },

    /*
     * Ready(): Order is ready to go.
     *
     * @resolve
     *
     *         · protocol.ok: Ready to go.
     *
     * @reject
     *
     *         · protocol.not_found: Not found.
     *         · protocol.empty: Driver is empty.
     */

    Ready: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.sequelize.transaction((trans1) =>
            {
                    return models.order_deliver
                        .findOne(
                        {
                            where:
                            {
                                orderid: req.body.id,
                            },
                        },
                        {
                            transaction: trans1
                        })
                        .then((taken) =>
                        {
                            if (taken.driver != null)
                            {
                                return reject([protocol.not_found]);
                            }

                            return models.order_deliver
                                .update(
                                {
                                    status: "ready",
                                },
                                {
                                    where:
                                    {
                                        orderid: req.body.id,
                                    },
                                },
                                {
                                    transaction: trans1
                                })
                                .then(function(result)
                                {
                                    if (result && result.length != 0)
                                    {
                                        return 1;
                                    }
                                    else
                                    {
                                        return reject([protocol.empty]);
                                    }
                                });
                        });
                })
                .then((result) =>
                {
                    return resolve(protocol.ok);
                })
                .catch((error) =>
                {
                    return reject(error);
                });
        });
    },

    /*
     * IsAvailable(): Checks whether an user is a driver.
     *
     * @resolve
     *
     *         · next(): User is not a driver.
     */

    IsAvailable: async function(req, res, next)
    {
        return new Promise((resolve, reject) =>
        {
             return models.drivers.findOne({ where: { userid: req.self.user }, attributes: ["available"] }).then((result) =>
             {
                    if (result == null || result.length == 0)
                    {
                        return res.status(httpr.bad_request).send(
                        {
                            codes: [protocol.no_driver],
                        });
                    }

                    if (result.available == 0)
                    {
                        return res.status(httpr.bad_request).send(
                        {
                            codes: [protocol.not_found],
                        });
                    }

                    return next();
             })
             .catch(function(error)
             {
                    return res.status(httpr.bad_request).send(
                    {
                        codes: [protocol.operation_failed],
                    });
             });
        });
    },

    /*
     * GetUnassigned(): Returns un-assigned jobs. Keep in mind that this function will only return
     *                  orders that are 'ready' to take.
     *
     * @parameters
     *
     *          · status: ready
     *          · driver: Null, so no driver assigned.
     *
     * @resolve
     *
     *          · result: Resolving user.
     *
     * @reject
     *
     *          · empty: No items found, so basically no orders.
     */

    GetUnassigned: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.order_deliver
                .findAndCountAll(
                {
                    offset: req.self.offset,
                    limit: req.self.limit,
                    where:
                    {
                        driver: null,
                        status: "ready",
                    },
                })
                .then((result) =>
                {
                    if (!result || result.length == 0)
                    {
                        return reject([protocol.empty]);
                    }
                    else
                    {
                        return resolve(result);
                    }
                })
                .catch(function(error)
                {
                    return reject(error);
                });
        });
    },

    /*
     * Get(): Gets drivers deliver by status.
     *
     * @parameters
     *   · req.body.status: The status of drivers to filter by.
     *
     * @resolve
     *   · Object: Result object containing drivers delivered by the specified status.
     *            Structure: { count: <Number>, rows: <Array> }
     *
     * @reject
     *   · [protocol.empty]: No records found for the specified status.
     *   · [protocol.error]: An error occurred during the process.
     */

    Get: async function(req) 
    {
        return new Promise((resolve, reject) => 
        {
            return models.order_deliver.findAndCountAll(
            {
                    offset: req.self.offset,
                    limit: req.self.limit,
                    where: 
                    {
                        status: req.body.status,
                    },
                })
                .then((result) => 
                {
                    if (!result || result.length == 0) {
                        return reject([protocol.empty]);
                    } else {
                        return resolve(result);
                    }
                })
                .catch(function(error) {
                    return reject([protocol.error]);
                });
        });
    },


    /*
     * Add(): Adds a new driver; this is achieved by modifying entries in the drivers table.
     *
     * @parameters
     *
     *          · body.id: Driver to add.
     *
     * @resolve
     *
     *          · protocol.ok: Added driver.
     *
     * @reject
     *
     *          · protocol.empty: Empty seat.
     */

    Add: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.sequelize.transaction((trans1) =>
                {
                    return models.drivers.create(
                    {
                        userid: req.body.id
                    },
                    {
                        transaction: trans1
                    }).then(function(result)
                    {
                        if (result && result.length != 0)
                        {
                            return resolve(protocol.ok);
                        }
                        else
                        {
                            return reject([protocol.empty]);
                        }
                    });
                })
                .then((result) =>
                {
                    return resolve(protocol.ok);
                })
                .catch((error) =>
                {
                    Logs.error(
                    {
                        url: req.originalUrl,
                        headers: req.headers,
                        body: req.body,
                        error: error,
                        user: req.body.id
                    }, process.env.ROUTE_STREAM);
                    return reject(error);
                });
        });
    },


    /*
     * Take(): Takes a new order.
     *
     * @parameters
     *
     *          · body.orderid: Order to take.
     *
     * @resolve
     *
     *          · protocol.ok:
     *
     * @reject
     *
     *          · protocol.empty: Empty seat.
     */

    Take: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.sequelize
                .transaction((trans1) =>
                {
                    return models.order_deliver
                        .findOne(
                        {
                            where:
                            {
                                orderid: req.body.id,
                                status: "ready",
                            },
                        },
                        {
                            transaction: trans1
                        })
                        .then((taken) =>
                        {
                            /* Check whether order has been assigned to somebody else */
                            if (taken != null)
                            {
                                return reject([protocol.busy]);
                            }

                            return models.order_deliver
                                .update(
                                {
                                    driver: req.self.user,
                                },
                                {
                                    where:
                                    {
                                        orderid: req.body.id,
                                    },
                                },
                                {
                                    transaction: trans1
                                })
                                .then(function(result)
                                {
                                    if (result && result.length != 0)
                                    {
                                        return 1;
                                    }
                                    else
                                    {
                                        return reject([protocol.empty]);
                                    }
                                });
                        });
                })
                .then((result) =>
                {
                    return resolve(protocol.ok);
                })
                .catch((error) =>
                {
                    return reject(error);
                });
        });
    },

    /*
     * Untake(): Untakes an order.
     *
     * @parameters
     *
     *          · body.orderid: Untakes an order.
     *
     * @resolve
     *
     *          · protocol.ok:
     *
     * @reject
     *
     *          · protocol.no_assoc: No association.
     */

    Untake: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.sequelize
                .transaction((trans1) =>
                {
                    return models.order_deliver
                        .findOne(
                        {
                            where:
                            {
                                orderid: req.body.id,
                            },
                        },
                        {
                            transaction: trans1
                        })
                        .then((taken) =>
                        {
                            if (taken.driver != req.self.user)
                            {
                                return reject([protocol.no_assoc]);
                            }

                            return models.order_deliver
                                .update(
                                {
                                    driver: null,
                                },
                                {
                                    where:
                                    {
                                        orderid: req.body.id,
                                    },
                                },
                                {
                                    transaction: trans1
                                })
                                .then(function(result)
                                {
                                    if (result && result.length != 0)
                                    {
                                        return 1;
                                    }
                                    else
                                    {
                                        return reject([protocol.empty]);
                                    }
                                });
                        });
                })
                .then((result) =>
                {
                    return resolve(protocol.ok);
                })
                .catch((error) =>
                {
                    return reject(error);
                });
        });
    },

    CountFullAvailable: async function(req, res, next)
    {
        return models.sequelize
            .query(
                "SELECT count(*) as counter from users RIGHT JOIN user_info ON users.id = user_info.userid RIGHT JOIN drivers ON drivers.userid = users.id",
                {
                    replacements:
                    {
                        available: req.body.available,
                    },
                    type: models.sequelize.QueryTypes.SELECT,
                }
            )
            .then((results) =>
            {
                if (results.length == 0)
                {
                    req.self.results = 0;
                    return res.status(httpr.bad_request).send(
                    {
                        codes: [protocol.empty],
                    });
                }
                else
                {
                    req.self.results = results[0]["counter"];
                }

                return next();
            });
    },

    GetFullAvailable: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.sequelize
                .query(
                    "SELECT *, users.createdat as user_created from users RIGHT JOIN user_info ON users.id = user_info.userid RIGHT JOIN drivers ON drivers.userid = users.id WHERE (drivers.available = :available) LIMIT :limit OFFSET :offset",
                    {
                        replacements:
                        {
                            available: req.body.available,
                            limit: req.self.limit,
                            offset: req.self.offset,
                        },
                        type: models.sequelize.QueryTypes.SELECT,
                    }
                )
                .then((results) =>
                {
                    if (results.length == 0)
                    {
                        return reject([protocol.empty]);
                    }
                    else
                    {
                        var all = [];

                        results.forEach(async (item) =>
                        {
                            var adding = {};

                            adding["id"] = item.userid;
                            adding["email"] = item.email;
                            adding["first"] = item.first;
                            adding["last"] = item.last;
                            adding["verified"] = item.available;
                            adding["created"] = item.updatedat;

                            all.push(adding);
                        });

                        return resolve(all);
                    }
                })
                .catch(function(error)
                {
                    return reject([protocol.empty]);
                });
        });
    },

    /*
     * GetAvailable(): Retrieves all drivers within an specific range
     *
     * @parameters
     *
     *          · body.[offset, limit]: Range, which is later checked by Etc.RangeCheck.
     *
     * @resolve
     *
     *          · [result]: Drivers list.
     *
     * @return
     *
     *          · protocol.empty: No Items found.
     */

    GetAvailable: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.drivers
                .findAll(
                {
                    offset: req.self.offset,
                    limit: req.self.limit,
                    where:
                    {
                        available: req.body.available,
                    },
                })
                .then((result) =>
                {
                    if (!result || result.length == 0)
                    {
                        return reject([protocol.empty]);
                    }
                    else
                    {
                        return resolve(result);
                    }
                })
                .catch(function(error)
                {
                    return reject(error);
                });
        });
    },

    /*
     * Delete(): Deletes a driver by updating the 'delete' bool.
     *
     * @parameters
     *
     *          · body.id: User ID to remove.
     *
     * @resolve
     *
     *          · protocol.ok: User removed.
     *
     * @return
     *
     *          · protocol.empty: Drive ID does not exists or is alredy removed.
     */

    Delete: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
              return models.sequelize.transaction((trans1) =>
              {
                    return models.drivers.destroy({ where: { userid: req.body.id }}).then((result) =>
                    {
                         if (result != null && result != 0)
                         {
                              return resolve(protocol.ok);
                         }

                         return reject([protocol.operation_failed]);
                    });
              });
        });
    },

    /*
     * IsDriver(): Checks whether an user is a driver.
     *
     * @resolve
     *
     *         · next(): User is not a driver.
     */

    IsDriver: async function(req, res, next)
    {
        return new Promise((resolve, reject) =>
        {
            return models.drivers
                .findOne(
                {
                    where:
                    {
                        userid: req.body.id,
                    },
                })
                .then((result) =>
                {
                    if (!result || result.length == 0)
                    {
                        return next();
                    }

                    return res.status(httpr.bad_request).send(
                    {
                        codes: [protocol.exists],
                    });
                })
                .catch(function(error)
                {
                    return res.status(httpr.bad_request).send(
                    {
                        codes: [protocol.operation_failed],
                    });
                });
        });
    },

    /*
     * RemoveAll(): Remove all drivers.
     *
     * @resolve
     *
     *        · protocol.ok: All drivers removed.
     *
     * @reject
     *
     *        · protocol.operation_failed: Failed to remove drivers.
     *
     */

    RemoveAll: async function(req, res, next)
    {
        return new Promise((resolve, reject) =>
        {
            return models.drivers.destroy(
            {
                where:
                {}
            }).then((result) =>
            {
                if (result != null)
                {
                    return resolve(protocol.ok);
                }

                return reject([protocol.operation_failed]);
            });
        });
    },

    /*
     * CountAll(): Counts all drivers' within your system.
     *
     * @return
     *
     *         · total: Total collections.
     */

    CountAll: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.drivers.count({}).then(function(result)
            {
                req.self.calc["all"] = result;
                return resolve();
            });
        });
    },

    /*
     * CountWhere(): Counts all drivers' within your system.
     *
     * @return
     *
     *         · total: Total collections.
     */

    CountWhere: async function(req, status)
    {
        return new Promise((resolve, reject) =>
        {
             return models.drivers.count({ where: { available: status }}).then(function(result)
             {
                 req.self.calc[status] = result;
                 return resolve();
             });
        });
    },

    /*
     * CountProductViews(): Counts all drivers' within your system.
     *
     * @return
     *
     *         · total: Total collections.
     */

    CountRides: async function(req, status)
    {
        return new Promise((resolve, reject) =>
        {
            return models.order_deliver.count(
                {
                    where:
                    {
                        driver: req.self.user,
                        status: status,
                    },
                })
                .then(function(result)
                {
                    req.self.calc[status] = result;
                    return resolve();
                });
        });
    },

    /*
     * DriverStats(): Counts stats for all drivers.
     *
     * @return
     *
     *         · total: Total driver stats.
     */

    DriverStats: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return Promise.all([
                module.exports.CountRides(req, "ok"),
                module.exports.CountRides(req, "pending"),
                module.exports.CountRides(req, "notfound"),
                module.exports.CountRides(req, "nodriver"),
            ]).then((result) =>
            {
                return resolve(req.self.calc);
            });
        });
    },

    /*
     * StatsBoth(): Counts stats for all drivers.
     *
     * @return
     *
     *         · total: Total driver stats.
     */

    StatsBoth: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return Promise.all([
                module.exports.CountAll(req),
                module.exports.CountWhere(req, true),
                module.exports.CountWhere(req, false),
            ]).then((result) =>
            {
                return resolve(req.self.calc);
            });
        });
    },

    /*
     * GetStatus(): Returns status on a given driver.
     *
     * @parameters
     *
     *         · userid: Requesting ID
     *
     * @resolve
     *
     *         · result.available: Available status.
     *
     *
     * @reject:
     *
     *         · error: Error found.
     */

    GetStatus: async function(req)
    {
         return new Promise((resolve, reject) =>
         {
                return models.drivers.findOne({ where: { userid: req.self.user }}).then((result) =>
                {
                     return resolve(result.available);
                })
                .catch(function(error)
                {
                     return reject(error);
                });
         });
    },

    /*
     * SetStatus(): Sets an status for a given driver.
     *
     * @parameters
     *
     *            · body.value: Either true or false.
     *
     * @resolve
     *      · protocol.ok: Status updated.
     */

    SetStatus: async function(req)
    {
        return new Promise((resolve, reject) =>
        {
            return models.sequelize.transaction((trans1) =>
            {
                    return models.drivers.update({ available: req.body.value }, { where: { userid: req.self.user }}, { transaction: trans1 }).then(function(result)
                    {
                            if (result && result.length != 0)
                            {
                                 return models.order_deliver.update({ driver: null }, { where: { driver: req.self.user }}, { transaction: trans1 }).then(function(result2)
                                 {
                                      return resolve(protocol.ok);
                                 });
                            }
                            else
                            {
                                return reject([protocol.empty]);
                            }
                    });
                })
                .then((result) =>
                {
                    return resolve(protocol.ok);
                })
                .catch((error) =>
                {
                    return reject(error);
                });
        });
    },
};