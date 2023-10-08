var express = require("express");
const csv = require("csv-parser");
const axios = require("axios");
const streamifier = require("streamifier");
const { inRadius } = require("../utils/coordUtils");
const moment = require('moment');
require("dotenv").config();

var router = express.Router();
response_results = null;
results_date = "";

key = process.env.MAP_KEY;
router.get("/hello", async function (req, res, next) {
  res.send("Hello World");
})
router.post("/fires", async function (req, res, next) {
  la = req.body["la"];
  lo = req.body["lo"];
  radius = req.body["radius"];
  console.log("la", "lo", "radius");
  console.log(la,lo,radius);
    const date = moment().subtract(1, 'days').format('YYYY-MM-DD');

  area_url =
    "https://firms.modaps.eosdis.nasa.gov/api/area/csv/" +
    key +
    "/VIIRS_NOAA20_NRT/world/1/"+date;

  if(results_date!=date||response_results==null){
    results_date = date;
    response_results = await axios.get(area_url);

  }

  const in_rad = [];
    streamifier
      .createReadStream(response_results.data)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        results.forEach((r) => {
          if (
            inRadius(
              parseFloat(r.latitude),
              parseFloat(r.longitude),
              la,
              lo,
              radius
            )
          ) {
            in_rad.push(r);
          }
        });
        res.send(in_rad);
      });
});

module.exports = router;
