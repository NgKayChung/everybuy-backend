var express = require('express');
var router = express.Router();

var MYSQL = require('../models/DBConnection');

/* POST API - Shipping Options */
router.post('/', function(req, res) {
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

module.exports = router;