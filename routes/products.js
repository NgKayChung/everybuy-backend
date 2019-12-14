var express = require('express');
var router = express.Router();

var MYSQL = require('../models/DBConnection');

/* POST API - Products */
router.post('/', function(req, res) {
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
router.post('/category', function(req, res) {
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
router.post('/filter', function(req, res) {
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
router.post('/search/:name', function(req, res) {
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
router.post('/details', function(req, res) {
    var product_id = req.body.id;
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

module.exports = router;