var express = require('express');
var router = express.Router();

var MYSQL = require('../models/DBConnection');

/* POST API - Retrieves delivery addresses by user */
router.post('/', function(req, res) {
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
router.post('/create', function(req, res) {
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

module.exports = router;