import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {User} from '../models/user.model.js'

//generate access and refresh token logics
const generateAccessAndRefreshTokens=async(userId)=>{
        try{
            const user=await User.findById(userId)
            
            // Safety check: ensure the user document exists before running methods
            if (!user) {
                throw new ApiError(404, "User not found for token generation")
            }

            const accessToken=user.generateAccessToken()
            const refreshToken=user.generateRefreshToken()
            user.refreshToken=refreshToken
            await user.save({validateBeforeSave:false})
            return {accessToken,refreshToken}
        }catch(err){
        //    console.error("THE HIDDEN SYSTEM ERROR IS:", err);

        //     if (err instanceof ApiError) throw err;
            throw new ApiError(500,"something went wrong while generating access and refresh token")
        }
    }
const options= {
    httpOnly:true,
    secure:true
}
//for register the user email and password is require mainly but takes the username and fullname also
const registerUser=asyncHandler(async(req,res)=>{
    const {username,fullname,email,password}=req.body
    //check the important credentials
    if(!(password  && email && username)){
        console.log("email and password both are required")
        throw new ApiError(400, "All fields are required")
    }
    //if already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
    const user=await User.create({
        username:username.toLowerCase(),
        email,
        password,
        fullname
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})
//login logic 
const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body
    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }
    if(!password){
        throw new ApiError(400,"password is required for login")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"user does not exists please register first")
    }
    const validUser=await user.isPasswordCorrect(password)
    if(!validUser){
        throw new ApiError(400,"password is incorrect!")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    // console.log(accessToken)
    // console.log(refreshToken)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
    return res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user logged in successfully"))
})
export {registerUser,loginUser}