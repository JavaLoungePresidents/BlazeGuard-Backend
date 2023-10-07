const mysql = require("mysql2");
var express = require("express");
const { inRadius } = require("../utils/coordUtils");

require("dotenv").config();

var router = express.Router();

var connection = mysql.createConnection({
  host: process.env.HOST,
  user: "root",
  password: process.env.PASSWORD,
  database: process.env.DB,
  port: 3306,
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected to DB!");
});
router.post("/submit", async function (req, res, next) {
  const { report_datetime, image_validated, latitude, longitude } = req.body;
  const sql =
    "INSERT INTO reports (report_datetime, image_validated, latitude, longitude) VALUES (?, ?, ?, ?)";
  const values = [report_datetime, image_validated, latitude, longitude];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ error: "An error occurred while inserting data" });
    } else {
      console.log("Data inserted successfully:", result);
      res.status(200).json({ message: "Data inserted successfully" });
    }
  });
});
router.get("/reports", async function (req, res, next) {
  const sql = "SELECT * FROM blazeguard";
  const reps = [];
  connection.query(sql, (err, results) => {
    results.forEach((r) => {
      if (
        inRadius(
          r.latitude,
          r.longitude,
          req.body.lat,
          req.body.lon,
          req.body.radius
        )
      ) {
        reps.push(r);
      }
    });
    res.send(reps);
  });
});

module.exports = router;
