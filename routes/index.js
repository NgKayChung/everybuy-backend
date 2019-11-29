var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let responseJSON = {
    "username": "Johnny",
    "email_address": "john@gmail.com",
    "phone_number": "012-3456789"
  };

  res.send(responseJSON);
});

module.exports = router;