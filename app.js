var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var Data = require('./config').data
var app = express();
var url = require('./url')

//Connect mongodb
mongoose.connect('mongodb://localhost:27017/POS',{useNewUrlParser:true});
app.use(bodyParser.urlencoded({
    extended: true
}));
  
app.use(bodyParser.json());
app.use('/',url);
app.listen(Data.server_port,console.log("listening"));
