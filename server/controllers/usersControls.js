const User =require('../models/Users');
const Order=require('../models/Orders');
const Product=require('../models/Product');


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
const userHistory=async(req,res)=>{
    try{
     const user = await Order.find({ buyer: req.userId })
      .populate('products.product')   // populate product info
      .populate('seller', 'name email'); // populate seller info
        if(!user){
            return res.status(404).json({message:"Not transaction yet"})
        }
        res.status(200).json({message:"orders: ",user})
    }catch(err){
        console.error("error while fetching order history",err.message);
        res.status(500).json("server error");
    }
}
//Edit profile functionality
const editProfile=async(req,res)=>{
    try{
    const userId=req.user.id;
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
//remaining function which i want to add later -->
//edit item
//delete item
//product listing