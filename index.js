const express = require("express");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/microdb");

const app = express();

app.get("/health", (req, res) => {
  res.json({
    status: "Microservice running successfully",
    server: "vm-service",
    ip: "192.168.100.10"
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("API listening on port 3000");
});
