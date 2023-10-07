var express = require("express");
var router = express.Router();
require("dotenv").config();
router.get("/location", async function(req, res, next) {
  res.send("Hello Location!");
});
module.exports = router;
