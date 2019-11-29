var express = require('express');
var router = express.Router();
var cors = require('cors');
let crypto = require('crypto');

let config = require('../config');

var middleware = require('../middleware');
var MYSQL = require('../models/DBConnection');
var authCtrl = require('../controllers/auth');

router.all('*', cors(), function(req, res, next) {
    next();
});

router.options('/', cors());



/* POST API - Products */
router.post('/products', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query('SELECT * FROM `products_tb` WHERE `product_stock_nm` > 0;', function(query_error, result) {
                connection.release();
                if(query_error) {
                    res.send({ 'code': 40, 'message': 'Internal Server Error' });
                }
                else {
                    if(result.length > 0) {
                        res.send({ 'code': 20, 'message': 'Successful', data: result });
                    }
                    else {
                        res.send({ 'code': 40, 'message': 'No Product Found' });
                    }
                }
            });
        }
    });
});

/* POST API - Product Category */
router.post('/products/category', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query('SELECT DISTINCT `product_cat_st` AS `category` FROM `products_tb` UNION SELECT DISTINCT `product_subcat_st` AS `category` FROM `products_tb`;', function(query_error, result) {
                connection.release();
                if(query_error) {
                    res.send({ 'code': 40, 'message': 'Internal Server Error' });
                }
                else {
                    if(result.length > 0) {
                        res.send({ 'code': 20, 'message': 'Successful', data: result });
                    }
                    else {
                        res.send({ 'code': 40, 'message': 'No Product Found' });
                    }
                }
            });
        }
    });
});

/* POST API - Products Filter */
router.post('/products/filter', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    var sort_st = req.body.sort_type;
    var category_st = req.body.category;
    var min_price_nm = req.body.min_price;
    var max_price_nm = req.body.max_price;

    let sortStatement_st = "";
    switch(sort_st) {
        case "TOPSALES":
            sortStatement_st = "ORDER BY COUNT(*) DESC";
            break;
            
        case "PLOWHIGH":
            sortStatement_st = "ORDER BY \`products_tb\`.\`product_price_nm\` ASC";
            break;
            
        case "PHIGHLOW":
            sortStatement_st = "ORDER BY \`products_tb\`.\`product_price_nm\` DESC";
            break;
    }
    
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query(`SELECT \`products_tb\`.* FROM \`products_tb\` LEFT JOIN \`orders_tb\` ON \`orders_tb\`.\`product_id\` = \`products_tb\`.\`product_id\` WHERE ${ (category_st != undefined ? `(\`products_tb\`.\`product_cat_st\` = "${ category_st }" OR \`products_tb\`.\`product_subcat_st\` = "${ category_st }")` : "TRUE") } AND  ${ (min_price_nm != undefined ? `\`products_tb\`.\`product_price_nm\` >= ${ min_price_nm }` : "TRUE") } AND ${ (max_price_nm != undefined && max_price_nm > min_price_nm ? `\`products_tb\`.\`product_price_nm\` <= ${ max_price_nm }` : "TRUE") } AND \`products_tb\`.\`product_stock_nm\` > 0 GROUP BY \`products_tb\`.\`product_id\` ${ sortStatement_st };`, function(query_error, result) {
                connection.release();
                if(query_error) {
                    res.send({ 'code': 40, 'message': 'Internal Server Error' });
                }
                else {
                    res.send({ 'code': 20, 'message': 'Successful', data: result });
                }
            });
        }
    });
});

/* POST API - Products Search */
router.post('/products/search/:name', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    var product_name_match = req.params.name;
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query('SELECT * FROM `products_tb` WHERE `product_name_st` LIKE ? AND `product_stock_nm` > 0;', [ `%${ product_name_match }%` ], function(query_error, result) {
                connection.release();
                if(query_error) {
                    res.send({ 'code': 40, 'message': 'Internal Server Error' });
                }
                else {
                    if(result.length > 0) {
                        res.send({ 'code': 20, 'message': 'Successful', data: result });
                    }
                    else {
                        res.send({ 'code': 40, 'message': 'No Product Found' });
                    }
                }
            });
        }
    });
});

/* POST API - Products */
router.post('/products/:id', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    var product_id = req.params.id;
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query('SELECT * FROM `products_tb` WHERE `product_id` = ?;', [ product_id ], function(query_error, result) {
                connection.release();
                if(query_error) {
                    res.send({ 'code': 40, 'message': 'Internal Server Error' });
                }
                else {
                    if(result.length > 0) {
                        res.send({ 'code': 20, 'message': 'Successful', data: result[0] });
                    }
                    else {
                        res.send({ 'code': 40, 'message': 'No available product' });
                    }
                }
            });
        }
    });
});

/* POST API - User Login */
router.post('/users/login', cors(), (req, res) => authCtrl.login(req, res));

/* POST API - Guest Login */
router.post('/users/login/guest', cors(), (req, res) => authCtrl.guestLogin(req, res));

/* POST API - User Enquiry */
router.post('/users/enquiry', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query('SELECT `email_st`, `phone_number_st`, `username_st`, `firstname_st`, `lastname_st`, `birthdate_dt`, `gender_ch` FROM `users_tb` WHERE `username_st` = BINARY ?;', [ req.decoded.username ], function(query_error, result) {
                connection.release();
                if(query_error) {
                    res.send({ 'code': 40, 'message': 'Internal Server Error' });
                }
                else {
                    if(result.length > 0) {
                        res.send({ 'code': 20, 'message': 'Successful', data: result[0] });
                    }
                    else {
                        res.send({ 'code': 40, 'message': 'Incorrect username or password' });
                    }
                }
            });
        }
    });
});

/* POST API - Register new user */
router.post('/users/create', cors(), function(req, res) {
    let userData_obj = req.body;
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query('SELECT `username_st` FROM `users_tb` WHERE `username_st` = BINARY ?; SELECT `email_st` FROM `users_tb` WHERE `email_st` = BINARY ?; SELECT `phone_number_st` FROM `users_tb` WHERE `phone_number_st` = BINARY ?;', [ userData_obj.username_st, userData_obj.email_st, userData_obj.phoneNumber_st ], function(query_error, result) {
                if(query_error) {
                    res.send({ 'code': 40, 'message': 'Internal Server Error' });
                }
                else {
                    if(result[0].length > 0) {
                        res.send({ 'code': 40, 'message': 'Username already existed' });
                    }
                    else if(result[1].length > 0) {
                        res.send({ 'code': 40, 'message': 'Email address already registered' });
                    }
                    else if(result[2].length > 0) {
                        res.send({ 'code': 40, 'message': 'Phone number already registered' });
                    }
                    else {
                        let hashedPassword = crypto.createHash('sha256').update(userData_obj.password_st).digest('hex');
                        connection.query('INSERT INTO users_tb(`email_st`, `phone_number_st`, `username_st`, `firstname_st`, `lastname_st`, `password_st`) VALUES(?, ?, ?, ?, ?, ?);', [ userData_obj.email_st, userData_obj.phoneNumber_st, userData_obj.username_st, userData_obj.firstname_st, userData_obj.lastname_st, hashedPassword ], function(query_error, result) {
                            if(query_error) {
                                res.send({ 'code': 40, 'message': 'Internal Server Error' });
                            }
                            else {
                                res.send({ 'code': 20, 'message': 'Registration successful' });
                            }
                        });
                    }
                }
            });
            connection.release();
        }
    });
});

/* POST API - Shipping Options */
router.post('/shipping-options', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    if(req.body.id == undefined) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT * FROM `shipping_options_tb`;', function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            res.send({ 'code': 20, 'message': 'Successful', data: result });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'No shipping option available', data: [] });
                        }
                    }
                });
            }
        });
    }
    else if(!isNaN(req.body.id)) {
        let shipping_id = req.body.id;
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT * FROM `shipping_options_tb` WHERE `shipping_id` = ?;', [ shipping_id ], function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            res.send({ 'code': 20, 'message': 'Successful', data: result });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'No shipping option available', data: [] });
                        }
                    }
                });
            }
        });
    }
    else {
        res.send({ 'code': 40, 'message': 'Invalid parameter' });
    }
});

/* POST API - Retrieves delivery addresses by user */
router.post('/delivery-address', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    if(req.body.id == undefined) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT `delivery_address_tb`.* FROM `delivery_address_tb` LEFT JOIN `users_tb` ON `delivery_address_tb`.`user_id` = `users_tb`.`user_id` WHERE `users_tb`.`username_st` = ?;', [ req.decoded.username ], function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            res.send({ 'code': 20, 'message': 'Successful', data: result });
                        }
                        else {
                            res.send({ 'code': 20, 'message': 'No available order', data: [] });
                        }
                    }
                });
            }
        });
    }
    else if(!isNaN(req.body.id)) {
        let delivery_id = req.body.id;
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT `delivery_address_tb`.* FROM `delivery_address_tb` LEFT JOIN `users_tb` ON `delivery_address_tb`.`user_id` = `users_tb`.`user_id` WHERE `users_tb`.`username_st` = ? AND `delivery_address_tb`.`delivery_id` = ?;', [ req.decoded.username, delivery_id ], function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            res.send({ 'code': 20, 'message': 'Successful', data: result });
                        }
                        else {
                            res.send({ 'code': 20, 'message': 'No available order', data: [] });
                        }
                    }
                });
            }
        });
    }
    else {
        res.send({ 'code': 40, 'message': 'Invalid parameter' });
    }
});

/* POST API - Create delivery address by user */
router.post('/delivery-address/create', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    let deliveryDetails = req.body;
    if(deliveryDetails) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('INSERT INTO `delivery_address_tb` VALUES (NULL, (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?), ?, ?, ?, ?, ?, ?, ?, ?);', [ req.decoded.username, deliveryDetails.addr1_st, (deliveryDetails.addr2_st == "" ? null : deliveryDetails.addr2_st), deliveryDetails.state_st, deliveryDetails.zipcode_st, deliveryDetails.country_st, deliveryDetails.recName_st, deliveryDetails.recPhone_st, (deliveryDetails.remarks_st == "" ? null : deliveryDetails.remarks_st) ], function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        res.send({ 'code': 20, 'message': 'Successful Added Delivery Address' });
                    }
                });
            }
        });
    }
});

/* POST API - Create order */
router.post('/orders/create', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    let orderDetails = req.body;
    if(orderDetails) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT `product_price_nm` FROM `products_tb` WHERE `product_id` = ?; SELECT `courier_charge_nm` FROM `shipping_options_tb` WHERE `shipping_id` = ?;', [ orderDetails.product_id, orderDetails.shipping_id ], function(query_error, result) {
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result[0].length > 0 && result[1].length > 0) {
                            let productPrice_nm = result[0][0].product_price_nm;
                            let courierCharge_nm = result[1][0].courier_charge_nm;
                            let totalPrice_nm = productPrice_nm + courierCharge_nm;
                            connection.query('INSERT INTO `orders_tb` VALUES (NULL, CURTIME(), NULL, ?, (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?), NULL, ?, ?, 1, ?, "PENDING", NULL);  SELECT MAX(`order_id`) AS `inserted_order_id` FROM `orders_tb` WHERE `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?);', [ orderDetails.product_id, req.decoded.username, orderDetails.delivery_id, orderDetails.shipping_id, totalPrice_nm, req.decoded.username ], function(query_error, result) {
                                if(query_error) {
                                    res.send({ 'code': 90, 'message': 'Internal Server Error' });
                                }
                                else {
                                    if(result[1].length > 0) {
                                        let order_id = result[1][0].inserted_order_id;
                                        res.send({ 'code': 20, 'message': 'Successful', 'data': order_id });
                                    }
                                    else {
                                        res.send({ 'code': 40, 'message': 'Error in placing order' });
                                    }
                                }
                            });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'Error in placing order' });
                        }
                    }
                });
                connection.release();
            }
        });
    }
});

/* POST API - Update order details by user */
router.post('/orders/update', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    let orderDetails = req.body;
    if(orderDetails) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT `product_price_nm` FROM `products_tb` WHERE `product_id` = ?; SELECT `courier_charge_nm` FROM `shipping_options_tb` WHERE `shipping_id` = ?;', [ orderDetails.product_id, orderDetails.shipping_id ], function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result[0].length > 0 && result[1].length > 0) {
                            let productPrice_nm = result[0][0].product_price_nm;
                            let courierCharge_nm = result[1][0].courier_charge_nm;
                            let totalPrice_nm = productPrice_nm + courierCharge_nm;
                            connection.query('UPDATE `orders_tb` SET `created_time` = CURTIME(), `delivery_id` = ?, `shipping_id` = ?, `total_amount_nm` = ? WHERE `order_id` = ?;', [ orderDetails.delivery_id, orderDetails.shipping_id, totalPrice_nm, orderDetails.order_id ], function(query_error, result) {
                                if(query_error) {
                                    res.send({ 'code': 90, 'message': 'Internal Server Error' });
                                }
                                else {
                                    res.send({ 'code': 20, 'message': 'Successful' });
                                }
                            });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'Error in placing order' });
                        }
                    }
                });
            }
        });
    }
});


/* POST API - Remove/Set to fail for order by user */
router.post('/orders/remove', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    let orderId = req.body.order_id;
    if(orderId) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT `order_id` FROM `orders_tb` WHERE `order_id` = ? AND `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?);', [ orderId, req.decoded.username ], function(query_error, result) {
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result[0].length > 0) {
                            connection.query('UPDATE `orders_tb` SET `status_st` = "CANCELLED" WHERE `order_id` = ? AND `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?);', [ orderId, req.decoded.username ], function(query_error, result) {
                                if(query_error) {
                                    res.send({ 'code': 90, 'message': 'Internal Server Error' });
                                }
                                else {
                                    res.send({ 'code': 20, 'message': 'Successful' });
                                }
                            });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'Order not found' });
                        }
                    }
                });
                connection.release();
            }
        });
    }
});

/* POST API - Retrieves specific order details */
router.post('/orders/:id', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    let orderId = req.params.id;
    if(orderId) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT * FROM `orders_tb` WHERE `order_id` = ? AND `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?);', [ orderId, req.decoded.username ], function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            res.send({ 'code': 20, 'message': 'Successful', 'data': result[0] });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'Order not found' });
                        }
                    }
                });
            }
        });
    }
    else {
        res.send({ 'code': 40, 'message': 'Invalid parameter' });
    }
});

// POST - process user payment API
router.post('/payment', cors(), (req, res, next) => middleware.checkToken(req, res, next), function(req, res) {
    let stripe = require('stripe')(config.stripe_secret_key);
    const orderId = req.body.orderId;
    const tokenId = req.body.tokenId;

    if(orderId) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT `total_amount_nm` FROM `orders_tb` WHERE `order_id` = ? AND `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?);', [ orderId, req.decoded.username ], function(query_error, result) {
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            let amount_nm = result[0].total_amount_nm * 100;
                            stripe.charges.create({
                                amount: amount_nm,
                                currency: 'myr',
                                description: 'Purchase from EveryBuy',
                                source: tokenId,
                                statement_descriptor: 'Test Ecommerce',
                            })
                            .then((charge) => {
                                connection.query('UPDATE `orders_tb` SET `payment_time` = CURTIME(), `last4_card_no_st` = ?, `status_st` = "SUCCESS", `receipt_url_st` = ? WHERE `order_id` = ? AND `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?);', [ charge.payment_method_details.card.last4, charge.receipt_url, orderId, req.decoded.username ], function(query_error, result) {
                                    if(query_error) {
                                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                                    }
                                    else {
                                        res.send({ 'code': 20, 'message': 'Successful' });
                                    }
                                });
                            })
                            .catch((error) => {
                                res.send({ 'code': 40, 'message': error });
                            });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'Order not found' });
                        }
                    }
                });
                connection.release();
            }
        });
    }
    else {
        res.send({ 'code': 40, 'message': 'Invalid parameter' });
    }
});

module.exports = router;