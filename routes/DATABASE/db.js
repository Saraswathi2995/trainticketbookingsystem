var mysql = require("mysql");
var db;
var dbfunction=function(){}

dbfunction.prototype.connectDatabase=function(callback) {
  if (!db) {
    db = mysql.createConnection({
      host: "localhost",
      port: "3306",
      user: "root",  
      password: "",  
      database: "trainticketbookingsystem", 
      dateStrings: "Date", 
      multipleStatements: true,
    });  
    db.connect(function(err) {
      if (!err) {
        callback(null,db); 

      } else {  
        callback("Error connecting database!",null);
        
      }
    });
  }; 
}

module.exports = new dbfunction();
