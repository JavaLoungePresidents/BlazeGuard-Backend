var express = require("express");
const csv = require("csv-parser");
const axios = require("axios");
const streamifier = require("streamifier");
const { inRadius } = require("../utils/coordUtils");
require("dotenv").config();

var router = express.Router();

key = process.env.MAP_KEY;
router.get("/fires", async function (req, res, next) {
  la = req.body["la"];
  lo = req.body["lo"];
  radius = req.body["radius"];
  area_url =
    "https://firms.modaps.eosdis.nasa.gov/api/area/csv/" +
    key +
    "/VIIRS_NOAA20_NRT/world/1";

  const results = [];
  const in_rad = [];
  axios.get(area_url).then((response) => {
    streamifier
      .createReadStream(response.data)
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
});

module.exports = router;
