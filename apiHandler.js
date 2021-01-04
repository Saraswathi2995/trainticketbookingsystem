
//WEB ADMIN 

//Authentication

const webAuthentication = require("./routes/WEB/Authentication/login");
const agentRegistration = require("./routes/WEB/Profile/Agentregistration");
const trainDetails = require("./routes/WEB/Train/traindetails");
const ticketbooking = require("./routes/WEB/Train/ticketbooking");
const seatavailability = require("./routes/WEB/Train/seatavailablity");




let apiHandler = {  
    init: function(app,router,db,fs,async,dateFormat,bcrypt,jsonwebtoken,checkauth,transporter,request)

    {   
        let version = "/api/v1/";  

        

        //WEB ADMIN 
        //Authentication
        app.use(version,webAuthentication(router,db,async,jsonwebtoken,checkauth,bcrypt,transporter,fs));
        app.use(version,agentRegistration(router,db,async,fs));
        app.use(version,trainDetails(router,db,async,fs));
        app.use(version,ticketbooking(router,db,async,fs));
        app.use(version,seatavailability(router,db,async,fs));

      
        
       }      
};
module.exports = apiHandler;  
