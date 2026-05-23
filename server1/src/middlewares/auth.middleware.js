import {User} from '../models/user.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import jwt from 'jsonwebtoken'
export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    // console.log(token)
    if(!token){
        throw new ApiError(401,"No token available")
    }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedToken._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(401,"invailid token")
    }
    req.user=user
    next()
    }catch(err){
        throw new ApiError(401,err?.message||"token is invailid")
    }

})