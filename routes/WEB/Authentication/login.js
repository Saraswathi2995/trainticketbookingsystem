module.exports = function (router, db,async,jsonwebtoken,checkauth,bcrypt,transporter,fs) {


    router.post("/CreateUser", async (req, res) => {

      if (
      req.body.email == undefined ||
      req.body.email == "0" ||
      req.body.email == ""
      ) {
      res.send({ status: 0, msg: "Enter Valid email", data: [] });
       }

     var existlogindetails =await existlogindetailsCheckingHandler(req.body);


     console.log(existlogindetails)
     if(existlogindetails.status){
       res.send({ status: 0, msg: existlogindetails.msg, data: [] });
       return
     }
    var reqparm = req.body;
    var name=reqparm.name;
    var email = reqparm.email;
    var password = reqparm.password;
    var categoryId = reqparm.categoryId;
    //category 1 means Admin
  //category 2 means Agent

   
    var query =
    "INSERT INTO `mas_user`(`name`, `email`, `updated_on`, `category_id`,active_flag) VALUES ('"+reqparm.name+"','"+reqparm.email+"',Now(),'"+reqparm.categoryId+"',1);";
    
     
    db.query(query, async function (err, response) {
      if (err) {
        console.log(err);
        res.send({ status: 0, msg: "Failed", data: err });
      } else {
        if (response.affectedrows != 0) {
          password = await hashPassword(password);
          query =
             "update mas_user set password='" +
             password +
             "' where email='" +
             email +
             "' and category_id='"+categoryId+"'";
            
          var output = await updatePassword(query);
          console.log({ output: output });
          console.log({ output: output.err });
          var subject = "ConfirmUser";
          GeneratedToken = await GenerateToken({ email: req.body.email });
          var token = GeneratedToken.token;
          console.log({ token: token });
          var msg = token;
          var output = mailing(email, msg, subject);
          if ((output.status = 0)) {
            res.status(404).send({ status: 0, msg:"Mail Send Failed! Try again"});
          } else {
            res.send({ status: 1, msg: "Mail Send Successfully" ,data:msg});
          }
         
          res.send({
            status: 1,
            msg: "Success",
            data: [],
          });
        } else {
          res.send({ status: 0, msg: "failed", data: [] });
        }
      }
    });
  
  });

 function existlogindetailsCheckingHandler(requestData){

    return new Promise((resolve, reject) => {

      var query = "SELECT * FROM `mas_user` WHERE email = '"+requestData.email+"' AND category_id = '"+requestData.categoryId+"' and active_flag=1;";
      console.log(query);

      db.query(query,(err, response)=>{
              if(err){
                console.log(err);
            resolve({status: false, msg: "Failed"})

              }else{
                if(response.length > 0){
                  resolve({status: true, msg: "Already Email Id Registered"});

                }
                else
                   resolve({status: false, msg: "Welcome"});
              }
            })

    })

  }

 function updatePassword(query) {
    return new Promise((resolve) => {
      db.query(query, (err, response) => {
        if (err) {
          resolve(err);
          console.log({ err: err });
          return;
        } else {
          console.log({ response: response });
          resolve(response);
          return;
        }
      });
    });
  }

  //*******************************get  HashPassword***********************************************************//
  async function hashPassword(Userpassword) {
    console.log({ userPassword: Userpassword });
    const password = Userpassword;
    const setRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, setRounds, (err, hash_val) => {
        if (err) {
          reject(err);
        } else {
          console.log({ hash: hash_val });
          resolve(hash_val);
        }
      });
    });
    console.log({ hashedPassword: hashedPassword });
    return hashedPassword;
  }

 function mailing(mailId, message, subject) {
    return new Promise((resolve) => {
      var mailOptions = {
        from: "caprillsweet6@gmail.com",
        to: mailId,
        subject: subject,
        html: message,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        console.log(mailOptions);
        if (error) {
          console.log(error);
          resolve({
            status: 0,
            msg: "Mail Id is not valid",
            data: [],
          });
        } else {
          resolve({
            status: 1,
            msg: " Mail sent to the User",
            data: [],
          });
        }
      });
    });
  }

  

//******************* Create User functionality END *****************************/

 router.post("/ConfirmUser", checkauth, async (req, res) => {
    var reqParam = req.body;
    var email = reqParam.email;
    var password = reqParam.password;
    var categoryId = reqParam.categoryId;

    var query =
      "SELECT * FROM `mas_user` WHERE email ='" +
      email +
      "' and category_id='"+categoryId+"';";
    db.query(query, async function (err, response) {
      if (err) {
        console.log(err);
        res.send({ status: 0, msg: "Failed", data: err });
      } else {
        if (response.length > 0) {
          password = await hashPassword(password);
          query =
            "update mas_user set password='" +
            password +
            "' where email='" +
            email +
            "' ";
          var output = await updatePassword(query);
          console.log({ output: output });
          console.log({ output: output.err });
          res.send({
            status: 1,
            msg: "Password updated sucessfully",
            data: [],
          });
        } else {
          res.send({ status: 0, msg: "Invalid Mail ID", data: [] });
        }
      }
    });
  });

//******************* Confirm User functionality END *****************************/

router.post('/login',(req,res)=>{ 
  console.log("here"); 
  var reqParam=req.body;     
  var email=reqParam.email;     
  var password= reqParam.password;
  var categoryId=reqParam.categoryId;
    console.log({ENV_KEY:process.env.JWT_KEY});   

         var query =
      "SELECT * FROM `mas_user` WHERE email ='" +
      reqParam.email +
      "' and category_id='"+reqParam.categoryId+"' and active_flag=1;";
    
  db.query(query,function(err,response){  
  if(err){         
  console.log(err);          
  res.status(404).send({ status: 0, msg: 'Failed', error: err }); 
    } else
    {           
  console.log({length:response.length});
  console.log({length:response});  
  //**************************** If response is zero mail id doesn't exist  ************************************************************************/
  if(response.length<1)  
  {       
    return res.status(404).json({status: 1, msg: 'Authentication failed'});
  }      
  else 
  {    
    //**************************** Else mail id  exist  ************************************************************************/
    //**************************** Compare password which is encoded text in DB with user entered password which is plain text************************************************************************/
       bcrypt.compare(password,response[0].password,(error,result)=>{
    if(err) 
    {     
      res.status(401).send({ status: 0, msg: 'Authentication failed', error: error }); 
    }   
    if(result) 
    {    
      var output=response; 
      //**************************** JSONWEBTOKEN Sign() method  Generate TOKEN ************************************************************************/
      //**************************** JSONWEBTOKEN.sign(payload,secret_key,Token_expires_In) method  Generate TOKEN ************************************************************************/
      const token=  jsonwebtoken.sign({
       email:email,userId:response[0].id 
       },process.env.JWT_KEY,{expiresIn:"1h"});       
      console.log({output:output[0].password});     


      res.status(200).send({ status: 1, msg: 'Authentication success', data: response ,token:token}); 
    }     
    else    
    {   
      res.status(401).send({ status: 0, msg: 'Authentication failed', error: error }); 
    }   
    }    
     
    ); 
  //  res.send({ status: 1, msg: 'Success', data: [response] }); 
  }   
   }      
   });       
   });      
   //**********JSON TOKEN GENERATE*******************************************************************
  async function GenerateToken(payload)
   {
     //eg:payload={ email:email,userId:response[0].id }
     return new Promise((resolve) =>{
    const token=  jsonwebtoken.sign(payload,process.env.JWT_KEY,{expiresIn:"1h"});       
    console.log("test token",{token:token}); 

    resolve({ status: 1, msg: 'Authentication success', token:token}); 
        
     }) 
 
   }
 //**********JSON TOKEN GENERATE*******************************************************************


  
  

 return router;
};