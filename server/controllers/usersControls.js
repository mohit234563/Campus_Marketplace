const User =require('../models/Users');
const Order=require('../models/Orders');
const Product=require('../models/Product');
const bcrypt=require('bcrypt');

//all the user profile data stored in Db exept password
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
//gives the order/ purchase history of the users 
const userHistory = async (req, res) => {
    try {
        // Ensure you use the ID from your auth middleware
        const userId = req.userId; 

        // 1. Find orders where the current user is the buyer
        const orders = await Order.find({ buyer: userId })
            .populate('product')             // Fixed: matches your schema field 'product'
            .populate('seller', 'name email'); // Populate seller's name and email

        // 2. Logic check: find() returns [] if no orders are found
        if (orders.length === 0) {
            return res.status(404).json({ message: "No transaction history found" });
        }

        // 3. Success response
        res.status(200).json({ 
            message: "Orders fetched successfully", 
            orders 
        });

    } catch (err) {
        console.error("Error while fetching order history:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};
//Edit profile functionality
const editProfile=async(req,res)=>{
    try{
    const userId=req.userId;
    const{name,phone,address,avatar,password}=req.body;
    const updateData={}
    if(name)updateData.name=name;
    if(phone)updateData.phone=phone;
    if(address)updateData.address=address;
    if(avatar)updateData.avatar=avatar;
    if(password){
        const salt=await bcrypt.genSalt(10);
        updateData.password=await bcrypt.hash(password,salt);
    }
    const updatedUser=await User.findByIdAndUpdate(
        userId,
        {$set:updateData},
        {new:true,runValidators:true}
    ).select("-password");
    res.status(200).json({message:"profile updated successfully",user:updatedUser})
}catch(err){
    console.error("server error",err);
    res.status(500).json({message:"server error while editing profile"});
}
}
module.exports={userProfile,userHistory,editProfile}

