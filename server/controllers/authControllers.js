require('dotenv').config();
const users=require('../models/Users');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

exports.signup=async(req,res)=>{
    const{name,email,password}=req.body;
    try{
        let user=await users.findOne({email});
        if(user){
            return res.status(400).json({message:"user already exists"})
        }
        user=new users({name,email,password});
        const salt=await bcrypt.genSalt(10);
        user.password= await bcrypt.hash(password,salt);
        await user.save();
        const payload={userId:user.id}
        const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1h'})
        res.status(201).json({token,message:'User registered successfully'})
    }catch(err){
        console.error(err.message)
        res.status(500).send('server error during signup');
    }
}
exports.login=async(req,res)=>{
    const{email,password}=req.body;
    try{
        const user=await users.findOne({email})
        if(!user){
            return res.status(400).json({message:"user not exists"})
        }
        let check=await bcrypt.compare(password,user.password);
        if(!check){
            return res.status(400).json({message:"Invailid credentials"})
        }
        const token=jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:'1h'})
        res.status(201).json({token,message:"user login successfully"})
    }catch(err){
        console.error("server error",err.message)
        res.status(500).send('server error during login');
    }
}
