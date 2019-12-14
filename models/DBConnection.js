var mysql = require('mysql');

var mysqlPool  = mysql.createPool({
  connectionLimit : 10,
  host: 'localhost',
  user: 'ebuser',
  password: '12345678',
  database: 'everybuy_db',
  multipleStatements: true
});

module.exports = mysqlPool;