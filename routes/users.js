var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var MYSQL = require('../models/DBConnection');
var authCtrl = require('../controllers/auth');

/* POST API - User Login */
router.post('/login', (req, res) => authCtrl.login(req, res));

/* POST API - Guest Login */
router.post('/login/guest', (req, res) => authCtrl.guestLogin(req, res));

/* POST API - Register new user */
router.post('/create', function(req, res) {
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

module.exports = router;