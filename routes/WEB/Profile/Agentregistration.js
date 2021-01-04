module.exports = function (router, db, async,fs) {


  router.post("/getagentprofile", (req, res) => {
   try {
        var validationStatus = true;
        var Errors = [];
        var responseJson = {};
  
        if (req.body) {
          Object.entries(req.body).map((bodyKey, i) => {
            if (
              typeof bodyKey[1] == null ||
              bodyKey[1] == undefined ||
              bodyKey[1] == ""
            ) {
              Errors.push(`${bodyKey[0]} is empty or incorrect`);
              validationStatus = false;
            } 
            
          });
        } else {
          Errors.push("Request Body is empty");
          validationStatus = false;
        }
        if (!validationStatus) {
          responseJson.status = 0;
          responseJson.msg = "Invalida Request Body";
          responseJson.payload = Errors;
          return res.send(responseJson);
        } else {


          var query =

         "SELECT mas_agent.`id` As AgentId, `category_id`,mas_category.category, `name`, `dob`, `address`, email,`mobileno`, `profile_name`, `createdon`, `modified_on` FROM `mas_agent`  Inner join mas_category on mas_category.id=mas_agent.category_id WHERE mas_agent.`id` = '" + req.body.AgentId + "' and active_flag=1";
       
      db.query(query, async (err, response) => {
        if (err) {
          console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] }); 
      } else {
        if (response.length > 0) {
           
          res.send({
            status: 1,
            msg: "Success",
            data: response
          });
        } else { 
          res.send({
            status: 0,
            msg: "Data is Empty",
            data: response
          });
        }
      }
    });

   } 
 }catch {
        res.send({ status: 0, msg: "Internal Server Error", data: [] });
      }
    });

  //***************** get agent functionality End ****************************************


router.post("/agentregistration", async function (req, res) {

   var existagentdetails =await existagentCheckingHandler(req.body);

     console.log(existagentdetails)
     if(existagentdetails.status){
       res.send({ status: 0, msg: existagentdetails.msg, data: [] });
       return
     }
  var query ="";
    query += "INSERT INTO `mas_agent`(`category_id`, `name`, `dob`, `address`, email,`mobileno`, `createdon`,active_flag) VALUES (2,'"+req.body.Name+"','"+req.body.DOB+"','"+req.body.Address+"','"+req.body.email+"','"+req.body.mobileno+"',Now(),1)";

    console.log(query);
    
      db.query(query, async function (err, response) {
        if (err) {
          console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] }); 
        }
            else {
               var AgentId = response.insertId;

            
               var uploadData = req.files == null ? [] : Array.isArray(req.files.uploadFile) == true ? req.files.uploadFile : [req.files.uploadFile];

              let uploadImage_response = await uploadImage(uploadData, AgentId);//upload and insert data
              if (uploadImage_response.status == false) { error_status = false; error_message.push(uploadImage_response.response) }
                res.send({ status: 1, msg: "Agent added successfully", data: response  });



            }
        })
})

function uploadImage(data, AgentId) {
    return new Promise(resolve => {
        async.forEachOf(data, function (obj, index, callback) {
            var imageName = AgentId + "-" + new Date().getTime() + "-" + obj.name;
            console.log(imageName);
            obj.mv('./uploads/' + imageName, function (err) {
                if (err) {
                    console.log('err', err);
                } else {
                    console.log(obj)
                    var query = "UPDATE `mas_agent` SET `profile_name`='" + imageName + "' WHERE `id`='" + AgentId + "'";

                    console.log(query);
                    db.query(query, function (err, response) {
                        if (err) {
                            console.log(err);
                        }
                    });

                }
                callback();
            })
        },
            function (err) {
                if (err) {
                    console.log(err.message);
                    resolve({ status: false, response: err.message });
                } else {
                    resolve({ status: true, response: true });
                }
            });

    })
};


function existagentCheckingHandler(requestData){

    return new Promise((resolve, reject) => {

      var query = "SELECT * FROM `mas_agent` WHERE email = '"+requestData.email+"' and active_flag=1;";
      console.log(query);

      db.query(query,(err, response)=>{
              if(err){
                console.log(err);
            resolve({status: false, msg: "Failed"})

              }else{
                if(response.length > 0){
                  resolve({status: true, msg: "Already Registered User"});

                }
                else
                   resolve({status: false, msg: "Not An User"});
              }
            })

    })

  }


 router.put("/editagentprofile", async function (req, res) {
   
    var query="UPDATE `mas_agent` SET `name`='"+req.body.Name+"',`dob`='"+req.body.DOB+"',`address`='"+req.body.Address+"', `mobileno`='"+req.body.mobileno+"', modified_on = NOW() WHERE id='"+req.body.AgentId+"';";

     console.log(query);
    
      db.query(query, async function (err, response) {
        if (err) {
          console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] }); 
        }
            else {
               var AgentId = req.body.AgentId;

            
               var uploadData = req.files == null ? [] : Array.isArray(req.files.uploadFile) == true ? req.files.uploadFile : [req.files.uploadFile];

              let uploadImage_response = await uploadImage(uploadData, AgentId);//upload and insert data
              if (uploadImage_response.status == false) { error_status = false; error_message.push(uploadImage_response.response) }
                res.send({ status: 1, msg: "Agent Updated successfully", data: response  });



            }
        })
})



//***************** Add and Edit functionality End ****************************************

router.put("/deleteagent", async function (req, res) {
   
  var query="";  

    //query+="DELETE FROM mas_agent WHERE id='"+req.body.AgentId+"';";
    query +="update mas_agent set active_flag = '0' where mas_agent.id='"+req.body.AgentId+"';";
    query +="update mas_user set active_flag = '0' where mas_user.email='"+req.body.email+"' and category_id='"+req.body.category_id+"';";

 console.log(query)

  db.query(query, function (err, response) {
    if (err) {
      console.log(err.message)
    }
    else {
      res.send({ status: 1, msg: "Success", data: response });
    }
  })
})



 return router;
};