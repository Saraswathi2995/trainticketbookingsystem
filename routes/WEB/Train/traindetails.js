module.exports = function (router, db, async,fs) {

	router.post("/addtraindetails",async (req, res)=> {
 

   if(req.body.Comparment.length <= 0){
      res.send({ status: 0, msg: "Meal name is Empty", data: [] });
         return
      }

    console.log(req.body)
    
    var query =
      "INSERT INTO `mas_train`(`train_no`, `train_name`, `created_by`, `created_on`) VALUES ('" +
      req.body.Trainno +
      "','" +
      req.body.Trainname +
      "','" +
      req.body.createdby +
      "',Now());";

      console.log(query);
    db.query(query,async function (err, response) {
      if (err) {
        console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] }); 
      } else {
        console.log("response", response);
        if (response.affectedRows != 0) {

          var TrainId = response.insertId;

            var CompartmentAdding = await CompartmentAddingHandler(req.body,TrainId);

          res.send({ status: 1, msg: "Train Details Inserted Sucessfully", data: response });

        } else {
          res.send({ status: 0, msg: "Train Details  Not Inserted ", data: [] });
        }
      }
    });
  }); 

CompartmentAddingHandler=(requestData,TrainId)=> {
  return new Promise((resolve, reject)=>{

    var ComparmentList = requestData.Comparment;

     var query = ""

     for(i in ComparmentList){

      query += "INSERT INTO `mas_compartment`(`train_id`, `compartment_no`, `window_seat`, `middle_seat`, `aisle_seats`) VALUES ('"+TrainId+"','"+ComparmentList[i].Compartment_no+"','"+ComparmentList[i].Windowseat+"','"+ComparmentList[i].Middleseat+"','"+ComparmentList[i].Aisleseats+"');";
     }

     db.query(query, async (err, response)=>{
       if(err) { 
        console.log(err); 
        reject(err)
        return
      }
      else{
       resolve(true)
        return
       }
    })

   })

 }

 //***************** add train functionality End ****************************************

router.post("/totalnoseats", function (req, res) {

  var query = "SELECT train_id, compartment_no,SUM(IFNULL(`window_seat`, 0) + IFNULL(`middle_seat`, 0) + IFNULL(`aisle_seats`, 0)) AS `totalseats`  from mas_compartment WHERE train_id ='"+req.body.train_id+"' and compartment_no='"+req.body.compartment_no+"'";
  db.query(query, function (err, response) {
    if (err) {
      console.log(err.message);
      res.send({ status: 0, msg: "Failed", data: response });
    }
    else {
      res.send({ status:1, msg: "Success", data: response });
    }
      
  })
})


 router.post("/gettraindetails", (req, res) => {

  var query=" SELECT `train_id`, `train_no`, `train_name` FROM `mas_train` WHERE train_id='"+req.body.train_id+"'";
          
 console.log(query);

    db.query(query,async (err,response)=>{
        if(err){
           console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] }); 
        }else{
            if(response.length>0){
         
                   response.forEach(async (item, i) => {
                      response[i].Comparment = await compartmentdetails(response[i].train_id)
                       
                        
                        if(i == response.length - 1){
                            res.send({
                              status: 1,
                              msg: "Success",
                               data: response
                            
                            });

                        }

                    })
        }else{
                res.send({
                    status: 0,
                    msg: "No Data available please try again",
                    data: [],
                  });
            }
        }
    })
})


compartmentdetails=(train_id)=>{
    return new Promise((resolve, reject) =>{

      var query="SELECT `id` As CompartmentId, `train_id`, `compartment_no`, `window_seat`, `middle_seat`, `aisle_seats`,SUM(IFNULL(`window_seat`, 0) + IFNULL(`middle_seat`, 0) + IFNULL(`aisle_seats`, 0)) As totalnoofseats FROM `mas_compartment` WHERE train_id='"+train_id+"'  ORDER BY mas_compartment.`id` ASC " ;
        
        console.log(query)
        db.query(query,(err,response)=>{
            if(err){
                console.log(err);
                return reject(err);
            }else{
                if (response.length > 0) {
                  response.forEach(async (item, i) => {
            
            
                   response[i].trainseatdetails = await trainseatdetailshandler(
                      response[i].CompartmentId ,response[i].train_id
                    );

               if (i == response.length - 1) {
                    resolve(response);
                    }
                 });  
                  }else{

                      resolve([]);
                  }
            }
        })

    })
}


trainseatdetailshandler=(CompartmentId,train_id)=> {
  return new Promise((resolve, reject)=>{

        

         var query ="SELECT `id` As SeatId,  `seat_no`, `seat` FROM `mas_seat` where train_id='"+train_id+"' and compartment_id='"+CompartmentId+"'";
     

     db.query(query, async (err, response)=>{
       if(err) { 
        console.log(err); 
        reject(err)
        return
      }
      else{
        
       resolve(response)
        return
       }
    })

   })

 }

 	return router;
 };