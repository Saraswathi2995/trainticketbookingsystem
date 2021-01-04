module.exports = function (router, db, async,fs) {

 const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };


router.post("/seatarrangements", function (req, res) {

  var query = "SELECT train_id, compartment_no,SUM(IFNULL(`window_seat`, 0) + IFNULL(`middle_seat`, 0) + IFNULL(`aisle_seats`, 0)) AS `totalseats`  from mas_compartment WHERE train_id ='"+req.body.trainId+"' and mas_compartment.id='"+req.body.compartmentId+"'";
  db.query(query, function (err, response) {
    if (err) {
      console.log(err.message);
      res.send({ status: 0, msg: "Failed", data: response });
    
    } else {
        console.log("response", response);
        if (response.length>0) {

          response.forEach(async (item,i) => {


            response[i].Seatdetails = await seatdetailshandler(response[i].totalseats,req.body.trainId,req.body.compartmentId)       

            if(i == response.length - 1){

              res.send({
                status: 1,
                msg: "Success",
                data: [{ details: response }],
              });
            }

          })


        } else {
          res.send({ status: 0, msg: "Data is empty ", data: [] });
        }
      }
    });
  }); 

seatdetailshandler=(totalseats,trainId,compartmentId)=> {
  return new Promise((resolve, reject)=>{
  	var query="";

   for(var i=1;i<totalseats+1;i++)
      { 
console.log("count",i,totalseats)
    
    	if(i % 6 === 1 || i % 6 === 6)
    	{

console.log(i)
    		query += "INSERT INTO `mas_seat`( `train_id`, `compartment_id`, `seat_no`, `seat`) VALUES ('"+trainId+"','"+compartmentId+"','"+i+"','WS');";
              
    	}
    	if(i % 6 === 2 || i % 6 === 5)
    	{
console.log(i)

    		query += "INSERT INTO `mas_seat`( `train_id`, `compartment_id`, `seat_no`, `seat`) VALUES ('"+trainId+"','"+compartmentId+"','"+i+"','MS');";
    	}
    	if (i % 6 === 3 || i % 6 === 4)
    	{
console.log(i)

    		query += "INSERT INTO `mas_seat`( `train_id`, `compartment_id`, `seat_no`, `seat`) VALUES ('"+trainId+"','"+compartmentId+"','"+i+"','AS');";
    	}
      if (i % 6 === 0)
          {
console.log(i)

        query += "INSERT INTO `mas_seat`( `train_id`, `compartment_id`, `seat_no`, `seat`) VALUES ('"+trainId+"','"+compartmentId+"','"+i+"','WS');";
      }
    
}
     
console.log(query);
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




//***************** seat arrangements functionality End ****************************************



	router.post("/getavailablityseatdetailscount", (req, res) => {
    console.log(req.body);
    var query =
    "Select `window_seat`,`middle_seat`, `aisle_seats`,SUM(IFNULL(`window_seat`, 0) + IFNULL(`middle_seat`, 0) + IFNULL(`aisle_seats`, 0)) As totalnoofseats from mas_compartment where train_id='"+req.body.trainId+"' and id='"+req.body.compartmentId+"';";

     
    console.log("query", query);
    db.query(query, async (err, response) => {
      if (err) {
         console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] });
      } else {
        if (response.length > 0) {

             response.forEach(async (item, i) => {
 
        	 var Bookedticketcount = await BookedticketcountHandler(req.body);
           var WSBticketcount = await WSBticketcountHandler(req.body);
           var MSBticketcount = await MSBticketcountHandler(req.body);
           var ASBticketcount = await ASBticketcountHandler(req.body);
        	 console.log(Bookedticketcount)
        	 var totalnoofseats=response[0].totalnoofseats;
           var window_seat=response[0].window_seat;
           var middle_seat=response[0].middle_seat;
           var aisle_seats=response[0].aisle_seats;
           
        	 console.log("totalnoofseats", totalnoofseats);

        	  response[i].availableseatscount = (totalnoofseats - Bookedticketcount);
                response[i].availableWindowseatcount =  (window_seat - WSBticketcount);
                 response[i].availableMiddleseatcount = (middle_seat - MSBticketcount);
                response[i].availableAsileseatcount = (aisle_seats - ASBticketcount);
                
                      if(i == response.length - 1){
                            res.send({
                              status: 1,
                              msg: "Success",
                               data: response
                            
                            });

                        }

                    })
        } else {
          res.send({
            status: 0,
            msg: "No Data available please try again",
            data: [],
          });
        }
      }
    });
  });


 BookedticketcountHandler = (requestData) => {
    return new Promise((resolve, reject) => {

      var query = "SELECT count(id) AS totalnoofbookedseats FROM `trn_tr_booking` WHERE  book_date ='"+requestData.book_date+"' and cancel_status = 0";
      

     
      console.log(query);
      db.query(query, (err, response) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("response", response);
          if (response.length > 0) {
            console.log(response);
           
                if(response[0].totalnoofbookedseats == null){
                  resolve(0);
                  return
                }else{

                  resolve(response[0].totalnoofbookedseats);
                }

          
          } else {
            resolve(0);
          }
        }
      });
    });
  };

 
 ASBticketcountHandler = (requestData) => {
    return new Promise((resolve, reject) => {

       var query = "SELECT count(trn_tr_booking.id) AS totalnoofASBookedseats FROM `trn_tr_booking` Inner join trn_ticket on trn_ticket.booking_id=trn_tr_booking.id WHERE  book_date ='"+requestData.book_date+"' and cancel_status = 0 and seat_type='AS'";
      

     
      console.log(query);
      db.query(query, (err, response) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("response", response);
          if (response.length > 0) {
            console.log(response);
           
                if(response[0].totalnoofASBookedseats == null){
                  resolve(0);
                  return
                }else{

                  resolve(response[0].totalnoofASBookedseats);
                }

          
          } else {
            resolve(0);
          }
        }
      });
    });
  };

 
 WSBticketcountHandler = (requestData) => {
    return new Promise((resolve, reject) => {

      var query = "SELECT count(trn_tr_booking.id) AS totalnoofWSBookedseats FROM `trn_tr_booking` Inner join trn_ticket on trn_ticket.booking_id=trn_tr_booking.id WHERE  book_date ='"+requestData.book_date+"' and cancel_status = 0 and seat_type='WS'";
      

     
      console.log(query);
      db.query(query, (err, response) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("response", response);
          if (response.length > 0) {
            console.log(response);
           
                if(response[0].totalnoofWSBookedseats == null){
                  resolve(0);
                  return
                }else{

                  resolve(response[0].totalnoofWSBookedseats);
                }

          
          } else {
            resolve(0);
          }
        }
      });
    });
  };

 
 MSBticketcountHandler = (requestData) => {
    return new Promise((resolve, reject) => {

      var query = "SELECT count(trn_tr_booking.id) AS totalnoofMSBookedseats FROM `trn_tr_booking` Inner join trn_ticket on trn_ticket.booking_id=trn_tr_booking.id WHERE  book_date ='"+requestData.book_date+"' and cancel_status = 0 and seat_type='MS'";
      

     
      console.log(query);
      db.query(query, (err, response) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("response", response);
          if (response.length > 0) {
            console.log(response);
           
                if(response[0].totalnoofMSBookedseats == null){
                  resolve(0);
                  return
                }else{

                  resolve(response[0].totalnoofMSBookedseats);
                }

          
          } else {
            resolve(0);
          }
        }
      });
    });
  };

 

  return router;
 };