import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {User} from '../models/user.model.js'
import { Product } from '../models/product.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
const listProduct=asyncHandler(async(req,res)=>{
    const {itemName,catagory,description,price}=req.body
    const imageLocalPath = req.file?.path;
    if(!(itemName && catagory && description && price)){
        throw new ApiError(400,"All fields are required")
    }
    
    if (!imageLocalPath) {
            throw new ApiError(400, "image file is required")
        }
    
    const image = await uploadOnCloudinary(imageLocalPath)
    if(!image){
        throw new ApiError(400,"image is not uploaded as no url from cloudinary")
    }
    console.log(image.url);
    const product=await Product.create({
        productName:itemName,
        catagory,
        description,
        price,
        seller:req.user._id,
        image:image.url
    })
    // Instead of console.log("Product: " + product)
    console.log("Created Product:", product); 

    // OR for deep inspection:
    console.log("Detailed Product:", JSON.stringify(product, null, 2));
    const listedProduct=await Product.findById(product._id)
    if(!listedProduct){
        throw new ApiError(500,"something went wrong while uploading the product")
    }
    console.log(listedProduct)
    return res
    .status(200)
    .json(new ApiResponse(200,listedProduct,"producted listed successfully"))
})
const buyProduct=asyncHandler(async(req,res)=>{
    
})
export {listProduct}