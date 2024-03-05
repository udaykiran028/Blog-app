const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req,res,next){
    //get bearer token from headers of req
    const bearerToken = req.header.authorization;
    //if bearer token not available 
    if(!bearerToken){
        return res.send({message:"Unauthorized access. Please login to continue..."})    
    }
    //extract token from bearer token
    const token = bearerToken.split(" ")[1]
    try{
        //verify the token using json web token
        jwt.verify(token,process.env.SECRET_KEY)
    }catch(err){
        next(err)
    }
}

module.exports = verifyToken