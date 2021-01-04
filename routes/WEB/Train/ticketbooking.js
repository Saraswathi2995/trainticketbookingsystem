module.exports = function (router, db, async,fs) {



	router.post('/ticketbooking',async (req, res) => {

   if (
      req.body.passenger_name == undefined ||
      req.body.passenger_name == "0" ||
      req.body.passenger_name == ""
    ) {
      res.send({ status: 0, msg: "Enter Valid passenger_name", data: [] });
    }
   if (
      req.body.age == undefined ||
      req.body.age == "0" ||
      req.body.age == ""
    ) {
      res.send({ status: 0, msg: "Enter Valid age", data: [] });
    }

   if (
      req.body.gender == undefined ||
      req.body.gender == "0" ||
      req.body.gender == ""
    ) {
      res.send({ status: 0, msg: "Enter Valid gender", data: [] });
    }
    // for female id 1 and for male id 2

if (
      req.body.email == undefined ||
      req.body.email == "0" ||
      req.body.email == ""
    ) {
      res.send({ status: 0, msg: "Enter Valid email", data: [] });
    }

if (
      req.body.mobileno == undefined ||
      req.body.mobileno == "0" ||
      req.body.mobileno == ""
    ) {
      res.send({ status: 0, msg: "Enter Valid mobileno", data: [] });
    }

if (
      req.body.train_id == undefined ||
      req.body.train_id == "0" ||
      req.body.train_id == ""
    ) {
      res.send({ status: 0, msg: "Enter Valid train_id", data: [] });
    }
   
  var query = "";
 
    query +=
      "INSERT INTO `trn_tr_booking`(`passenger_name`, `age`, `gender`, `email`, `mobileno`, `train_id`, `book_date`, `agent_id`, `created_on`,`payment_status`) VALUES  ('" +
      req.body.passenger_name +
      "','" +
      req.body.age +
      "','" +
      req.body.gender +
      "','" +
      req.body.email +
      "','" +
      req.body.mobileno +
      "','" +
      req.body.train_id +
      "','" +
      req.body.book_date +
      "','" +
      req.body.agent_id +
      "',Now(),1);";
      console.log(query);
 
   db.query(query,async function (err, response) {
      if (err) {
       console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] });
      } else {
        console.log("response", response);
        if (response.affectedRows != 0) {

         var bookingId = response.insertId;
          var Priority = await PriorityCheckinghandler(bookingId,req.body)
                     
         res.send({ status: 1, msg: "Train Booked Sucessfully", data: [] });
     

        } else {
          res.send({ status: 0, msg: "Failed To Book ", data: [] });
        }
      }
    });
  }); 


PriorityCheckinghandler=(bookingId,requestData)=> {
  return new Promise((resolve, reject)=>{
    console.log(requestData)

     var query = "";
      if (requestData.age >=60 || requestData.age >="60" || requestData.gender=="1" ||requestData.gender== 1)
      {
         query += "update trn_tr_booking set priority = 1 where id='"+bookingId+"';";
      }
      else
      {
       query += "update trn_tr_booking set priority = 0 where id='"+bookingId+"';";
       }
       console.log(query);
      db.query(query, (err, response)=>{
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

//***************** ticket booking functionality End ****************************************

router.post("/Seatconfirmforticket", (req, res) => {
  
    var query =
     "SELECT Distinct(trn_tr_booking.`id`) As ticketbookingId, `passenger_name`, `age`, `gender`, `email`, `mobileno`, trn_tr_booking.`train_id`, mas_compartment.id As CompartmentId,`book_date`, `agent_id`, `created_on`, `payment_status`, `cancel_status`,priority FROM `trn_tr_booking` Inner join mas_compartment on mas_compartment.train_id=trn_tr_booking.train_id WHERE trn_tr_booking.`id`='"+req.body.bookingId+"' and cancel_status=0";

    console.log(query);

    db.query(query, async (err, response) => {
      if (err) {
        console.log(err.message); 
          res.send({ status: 0, msg: "Failed", data: [] });
      } else {
        if (response.length > 0) {
         

          response.forEach(async (item,i) => {

            response[i].Seatallocation = await seatallocationhandler(response[i].priority,response[i].book_date,response[i].train_id,response[i].CompartmentId,response[i].ticketbookingId)
           


            if(i == response.length - 1){

              res.send({
                status: 1,
                msg: "Success",
                data: [],
              });
            }

          })

        } else {
          res.send({
            status: 0,
            msg: "No Data Available",
            data: [],
          });
        }
      }
    });
  });



seatallocationhandler = (priority,book_date,train_id,CompartmentId,ticketbookingId) => {
return new Promise((resolve,reject) =>{

    var query ="";
      if (priority == 1 || priority =="1")
      {

        query +="select mas_seat.id As seatid, concat(`seat_no`, ' ' ,`seat`) As seatno,`seat` As seattype from mas_seat WHERE seat='WS' and train_id='"+train_id+"' and compartment_id='"+CompartmentId+"'and mas_seat.id NOT IN(select seat_id from trn_ticket Inner join trn_tr_booking on trn_tr_booking.id=trn_ticket.booking_id where trn_tr_booking.book_date='"+book_date+"') group by mas_seat.id";
      }
      else
      {
         query +="select mas_seat.id As seatid, concat(`seat_no`, ' ' ,`seat`) As seatno,`seat` As seattype from mas_seat WHERE seat='MS' and train_id='"+train_id+"' and compartment_id='"+CompartmentId+"'and mas_seat.id NOT IN(select seat_id from trn_ticket Inner join trn_tr_booking on trn_tr_booking.id=trn_ticket.booking_id where trn_tr_booking.book_date='"+book_date+"')group by mas_seat.id";
      }
      
    console.log(query);
    db.query(query, async (err,response)=>{
        if(err){
           console.log(err);
            reject(err);
        }else{
          console.log(response)
            if(response.length>0){
              let seatno=response[0].seatno;
             
                let ticketconfirm = await ticketgenerateHandler(response[0].seatno,response[0].seatid,ticketbookingId,response[0].seattype)
                resolve({Ticketseatno:seatno});
             
             
            }else{

              
                resolve(0)
            }
        }
    })
})
}

function ticketgenerateHandler(seatno,seatid,ticketbookingId,seattype){

return new Promise((resolve,reject)=>{

  console.log(seatno,seatid,ticketbookingId);


  var query="";
  query +=
  "INSERT INTO `trn_ticket`( `booking_id`, `seat_id`, seat_type,`ticket`) VALUES ('" +
      ticketbookingId +
      "','" +
      seatid+
       "','" +
      seattype+
       "','" +
      seatno+
       "')";
       

       console.log(query);
     db.query(query,async function (err, response) {
       if (err) {
       console.log(err);
            reject(err);
       } else {
        console.log("response", response);
         if (response.affectedRows != 0) {

          //let seatno = seatno;
          resolve(true);
        }else{
          resolve(0)
        }
        }
      })
     })
}

//***************** seat confirmation functionality End ****************************************

 router.post("/getbookingdetailsbydate", (req, res) => {
   
          var query =
          "select trn_ticket.`id` As TicketId, trn_tr_booking.`id` As BookingId,`train_no`, `train_name`, `compartment_no` , `passenger_name`, `age`, `gender`, `email`, `mobileno`, trn_tr_booking.`train_id`, `book_date`, `agent_id`, `payment_status`, `cancel_status`, `priority`,`seat_id`, `seat_type`, `ticket` from trn_tr_booking Inner join trn_ticket on trn_ticket.booking_id=trn_tr_booking.id Inner join mas_train on mas_train.train_id=trn_tr_booking.train_id  Inner join mas_compartment on mas_compartment.train_id=mas_train.train_id where book_date='"+req.body.book_date+"' group by trn_tr_booking.`id` ORDER BY  trn_tr_booking.`id` ASC;";

        
       
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

    });




  return router;
 };