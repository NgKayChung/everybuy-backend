var express = require('express');
var router = express.Router();
var cors = require('cors');

var middleware = require('../middleware');

var productsRoutes = require('./products');
var usersRoutes = require('./users');
var shippingOptionsRoutes = require('./shipping-options');
var deliveryAddressRoutes = require('./delivery-address');
var ordersRoutes = require('./orders');
var paymentRoutes = require('./payment');
var profileRoutes = require('./profile');

/* All methods to bypass cors rules */
router.all('*', cors(), function(req, res, next) {
    next();
});

router.use('/products', (req, res, next) => middleware.checkToken(req, res, next), productsRoutes);
router.use('/users', usersRoutes);
router.use('/shipping-options', (req, res, next) => middleware.checkToken(req, res, next), shippingOptionsRoutes);
router.use('/delivery-address', (req, res, next) => middleware.checkToken(req, res, next), deliveryAddressRoutes);
router.use('/orders', (req, res, next) => middleware.checkToken(req, res, next), ordersRoutes);
router.use('/payment', (req, res, next) => middleware.checkToken(req, res, next), paymentRoutes);
router.use('/profile', (req, res, next) => middleware.checkToken(req, res, next), profileRoutes);

module.exports = router;