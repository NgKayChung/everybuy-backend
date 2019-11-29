var mysql = require('mysql');

var mysqlPool  = mysql.createPool({
  connectionLimit : 10,
  host: 'https://everybuy.000webhostapp.com/',
  user: 'id11773908_ebuser',
  password: '12345678',
  database: 'id11773908_everybuy_db',
  multipleStatements: true
});
// var mysqlPool  = mysql.createPool({
//   connectionLimit : 10,
//   host: 'localhost',
//   user: 'ebuser',
//   password: '12345678',
//   database: 'everybuy_db',
//   multipleStatements: true
// });

module.exports = mysqlPool;