const jwt=require('jsonwebtoken');
module.exports=function(req,res,next){
 
    try  
    {  
        // var token= req.headers.Authorization.split(" ")[1];  
       console.log({Headers:req.headers});
        //console.log({Headers:req.body});
        var token= req.headers.authorization.split(" ")[1];   
        console.log({token:token});   
        var decoded =   jwt.verify(token,process.env.JWT_KEY);
    //var decoded =   jwt.verify(req.body.token,process.env.JWT_KEY);
    req.DecodedData=decoded; 
    console.log({DecodedData:decoded});    
    next();
    }  
    catch(error){
        res.send({status:0,msg:"Authentication failed",error:error}); 
    } 
        
} 
  