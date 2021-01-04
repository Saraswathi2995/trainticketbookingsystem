//**********************************ADD Modules HERE START***********************************************************************/
const environment =require('dotenv').config({ path: './.env' });
var express = require("express");
var app = express();
const router = express.Router();
var http = require("http").Server(app);
const fileUpload = require('express-fileupload');
var dbfunctions=require('./routes/DATABASE/db')
var apiHandler=require('./apiHandler');
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer"); 
var fs = require("fs");
var async = require("async");
var dateFormat = require("dateformat");
var bcrypt = require('bcrypt');  
var jsonwebtoken = require('jsonwebtoken'); 
const  checkauth = require('./routes/WEB/Authentication/checkauth');   
const request=require('request');

// api files
app.use(fileUpload());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser());    



var transporter = nodemailer.createTransport({
         host: "smtp.gmail.com",
         port: 465,
        secure: true,
         service: "gmail",
         sendMail: true,

         auth: {
           user: "caprillsweet6@gmail.com",
           pass: "Saranya8890"
         },
         tls: {
           rejectUnauthorized: false
         }
       });



//******** SET RESPONSE HEADER PROPERTIES  Start ***********/
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)         
  res.setHeader('Access-Control-Allow-Credentials', true); 
res.setHeader('Access-Control-Allow-Headers', '*');    
//  res.setHeader('Access-Control-Allow-Headers', 'Authorization');    

  // Pass to next layer of middleware
  next();
});
//********SET RESPONSE HEADER PROPERTIES  End *********/

//********Database connection & CALL API HANDLER  Start **********/
    
dbfunctions.connectDatabase(function(err,db){
if(err){
  console.log(err); 
}else{
  console.log("connected"); 
  apiHandler.init(app,router,db,fs,async,dateFormat,bcrypt,jsonwebtoken,checkauth,transporter,request);

     
} 
}) 
//********* Database connection & CALL API HANDLER  END ***********/


// runing on port
app.set("port", 8152);
app.set("host", "0.0.0.0");
http.listen(app.get('port'), '0.0.0.0', function () {
  console.log(
    "Express server listening on port " +
    app.get("host") +
    ":" + 
    app.get("port")
  );
});

//********* app PORT and IP Address setting END **********/


