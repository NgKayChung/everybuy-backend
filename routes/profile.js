var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var MYSQL = require('../models/DBConnection');

/* POST API - User Enquiry */
router.post('/enquiry', function(req, res) {
    MYSQL.getConnection(function(conn_error, connection) {
        if(conn_error) {
            res.send({ 'code': 90, 'message': 'Internal Server Error' });
        }
        else {
            connection.query('SELECT `email_st`, `phone_number_st`, `username_st`, `firstname_st`, `lastname_st`, DATE_FORMAT(`birthdate_dt`, "%Y-%m-%d") AS `birthdate_st`, `gender_st` FROM `users_tb` WHERE `username_st` = BINARY ?;', [ req.decoded.username ], function(query_error, result) {
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

// POST - user profile API
router.post('/edit', function(req, res) {
    const actionType = req.body.action;

    if(actionType) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                if(actionType == "profile") {
                    let username_st = req.body.username_st;
                    let userFirstName_st = req.body.firstname_st;
                    let userLastName_st = req.body.lastname_st;
                    let userEmail_st = req.body.email_st;
                    let userPhoneNumber_st = req.body.phoneNumber_st;
                    let userGender_st = req.body.gender_st;
                    let userBirthdate_st = req.body.birthdate_st;

                    connection.query('UPDATE `users_tb` SET `firstname_st` = ?, `lastname_st` = ?, `email_st` = ?, `phone_number_st` = ?, `gender_st` = ?, `birthdate_dt` = ? WHERE `username_st` = BINARY ?;', [ userFirstName_st, userLastName_st, userEmail_st, userPhoneNumber_st, userGender_st, userBirthdate_st, username_st ], function(query_error, result) {
                        if(query_error) {
                            res.send({ 'code': 90, 'message': 'Internal Server Error' });
                        }
                        else {
                            res.send({ 'code': 20, 'message': 'Successful' });
                        }
                    });
                    connection.release();
                }
                else if(actionType == "password") {
                    let username_st = req.body.username_st;
                    let userOldPassword_st = req.body.oldPassword_st;
                    let userNewPassword_st = req.body.newPassword_st;

                    let hashedOldPassword = crypto.createHash('sha256').update(userOldPassword_st).digest('hex');

                    connection.query('SELECT `password_st` FROM `users_tb` WHERE `username_st` = BINARY ?;', [ username_st ], function(query_error, result) {
                        if(query_error) {
                            connection.release();
                            res.send({ 'code': 90, 'message': 'Internal Server Error' });
                        }
                        else {
                            let queryOldPassword = result[0].password_st;
                            if(hashedOldPassword != queryOldPassword) {
                                res.send({ 'code': 40, 'message': 'Old password does not match with current password' });
                            }
                            else {
                                let hashedNewPassword = crypto.createHash('sha256').update(userNewPassword_st).digest('hex');
                                connection.query('UPDATE `users_tb` SET `password_st` = ? WHERE `username_st` = BINARY ?;', [ hashedNewPassword, username_st ], function(query_error, result) {
                                    if(query_error) {
                                        res.send({ 'code': 90, 'message': 'Internal Server Error' });
                                    }
                                    else {
                                        res.send({ 'code': 20, 'message': 'Successful' });
                                    }
                                });
                            }
                            connection.release();
                        }
                    });
                }
                else {
                    res.send({ 'code': 40, 'message': 'Invalid action' });
                }
            }
        });
    }
    else {
        res.send({ 'code': 40, 'message': 'Invalid parameter' });
    }
});

module.exports = router;