const mysql = require("mysql2");
require("dotenv").config();

var connection = mysql.createConnection({
  host: process.env.HOST,
  user: "root",
  password: process.env.PASSWORD,
  database: process.env.DB,
  port: 3306,
});
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to DB!");
});
module.exports = {
  connection,
};
