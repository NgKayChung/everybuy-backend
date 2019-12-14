var express = require('express');
var router = express.Router();

var MYSQL = require('../models/DBConnection');

/* POST API - Retrieves specific order details */
router.post('/', function(req, res) {
    let orderId = req.body.id;
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

/* POST API - Create order */
router.post('/create', function(req, res) {
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
router.post('/update', function(req, res) {
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
router.post('/remove', function(req, res) {
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

module.exports = router;