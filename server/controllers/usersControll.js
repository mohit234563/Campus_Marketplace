const User =require('../models/Users');

exports.totalUsers=async(req,res)=>{
    try{    
        let users= await User.countDocuments({});
        res.status(200).json({"total users:":users})
    }catch(err){
        console.error("error in finding the no of users",err.message);
        res.status(500).json({message:"server error while counting the users"})
    }   
}