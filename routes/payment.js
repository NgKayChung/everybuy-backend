var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var config = require('../config');
var MYSQL = require('../models/DBConnection');

// POST - process user payment API
router.post('/', function(req, res) {
    let stripe = require('stripe')(config.stripe_secret_key);
    const orderId = req.body.orderId;
    const tokenId = req.body.tokenId;

    if(orderId) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                connection.query('SELECT `total_amount_nm`, `qty_purchased_nm` FROM `orders_tb` WHERE `order_id` = ? AND `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?);', [ orderId, req.decoded.username ], function(query_error, result) {
                    if(query_error) {
                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            let amount_nm = result[0].total_amount_nm * 100;
                            let qty_nm = parseInt(result[0].qty_purchased_nm);
                            stripe.charges.create({
                                amount: amount_nm,
                                currency: 'myr',
                                description: 'Purchase from EveryBuy',
                                source: tokenId,
                                statement_descriptor: 'Test Ecommerce',
                            })
                            .then((charge) => {
                                connection.query('UPDATE `orders_tb` SET `payment_time` = CURTIME(), `last4_card_no_st` = ?, `status_st` = "SUCCESS", `receipt_url_st` = ? WHERE `order_id` = ? AND `user_id` = (SELECT `user_id` FROM `users_tb` WHERE `username_st` = ?); UPDATE `products_tb` SET `product_stock_nm` = `product_stock_nm` - ? WHERE `product_id` = (SELECT `product_id` FROM `orders_tb` WHERE `order_id` = ?);', [ charge.payment_method_details.card.last4, charge.receipt_url, orderId, req.decoded.username, qty_nm, orderId ], function(query_error, result) {
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