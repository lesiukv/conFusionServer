const cors = require("cors");
const express = require("express");

const whitelist = ["http://localhost:3000", "https://localhost:3443", "http://192.168.0.105:3000"];

var corsOptionsDelegate = (req, cb) => {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  cb(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);

