let jwt = require('jsonwebtoken');
let crypto = require('crypto');
let config = require('../config.json');
var MYSQL = require('../models/DBConnection');

class AuthController {
  login (req, res) {
    let username_submit_st = req.body.username;
    let password_submit_st = req.body.password;

    if (username_submit_st && password_submit_st) {
        MYSQL.getConnection(function(conn_error, connection) {
            if(conn_error) {
                res.send({ 'code': 90, 'message': 'Internal Server Error' });
            }
            else {
                let hashedPassword = crypto.createHash('sha256').update(password_submit_st).digest('hex');
                connection.query('SELECT * FROM `users_tb` WHERE `email_st` = BINARY ? OR `phone_number_st` = BINARY ? OR `username_st` = BINARY ? AND `password_st` = BINARY ?;', [ username_submit_st, username_submit_st, username_submit_st, hashedPassword ], function(query_error, result) {
                    connection.release();
                    if(query_error) {
                        res.send({ 'code': 40, 'message': 'Internal Server Error' });
                    }
                    else {
                        if(result.length > 0) {
                            let token = jwt.sign(
                                {
                                    username: result[0].username_st,
                                    loginTimestamp: Date.now()
                                },
                                config.secret
                            );
                            res.send({ 'code': 20, 'message': 'Successful', uid: token });
                        }
                        else {
                            res.send({ 'code': 40, 'message': 'Incorrect username or password' });
                        }
                    }
                });
            }
        });
    }
    else {
        res.send({ 'code': 40, 'message': 'Authentication failed' });
    }
  }

  guestLogin (req, res) {
    let username_submit_st = req.body.username;
    let password_submit_st = req.body.password;

    if (username_submit_st && password_submit_st) {
        let token = jwt.sign(
            { 
                username: username_submit_st,
                loginTimestamp: Date.now()
            },
            config.secret,
            {
                expiresIn: '1 day'
            }
        );
        res.send({ 'code': 20, 'message': 'Successful', uid: token });
    }
    else {
        res.send({ 'code': 40, 'message': 'Authentication failed' });
    }
  }
}

module.exports = new AuthController();