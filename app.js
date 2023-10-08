var express = require("express");
var cors = require("cors");
var mapsRouter = require("./routes/maps");
var reportRouter = require("./routes/report");

const port = 3001;
var app = express();

app.use(express.json());

app.use(cors());

app.use("/blaze/maps", mapsRouter);

app.use("/blaze/report", reportRouter);

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
