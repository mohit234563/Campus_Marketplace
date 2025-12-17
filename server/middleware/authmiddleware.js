require('dotenv').config();
const jwt=require('jsonwebtoken');

const authmiddleware=(req,res,next)=>{
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
        return res.status(400).json("No token,Authorization denied")
    }
    try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.userId=decoded.userId;
    next();
    }catch(err){
        res.status(401).json({message:"token is not valid"})
    }
}
module.exports=authmiddleware