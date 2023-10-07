var express = require("express");
var cors = require("cors");
var mapsRouter = require("./routes/maps");

const port = 3000;
var app = express();

app.use(express.json());

app.use(cors());

app.use("/api/maps", mapsRouter);

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});