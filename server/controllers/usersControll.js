const User =require('../models/Users');

const totalUsers=async(req,res)=>{
    try{    
        let users= await User.countDocuments({});
        res.status(200).json({"total users:":users})
    }catch(err){
        console.error("error in finding the no of users",err.message);
        res.status(500).json({message:"server error while counting the users"})
    }   
}
const userProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.userId).select('-password');
        if(!user){
            return res.status(404).json({message:"user does not exists"});
        }
        res.status(200).json(user);
    }catch(err){
        console.error("error fetching the profile data",err.message);
        res.status(500).json("server error while fetching the profile data");
    }
}
module.exports={totalUsers,userProfile}