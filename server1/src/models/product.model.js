import mongoose, {Schema} from 'mongoose'
const productSchema=new Schema({
    productName:{
        type:String,
        required:true,
        index:true
    },
    catagory:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    seller:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    buyer:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    image:{
        type:String, //cloudinary
        required:true
    },
    condition: {
    type: String,
    enum: ["new", "like-new", "good", "fair", "poor"],
    default: "good"
    },
    listingType: {
        type: String,
        enum: ["sell", "rent"],
        default: "sell"
    },
    isSold: {
        type: Boolean,
        default: false,
        index: true          // you'll filter by this constantly
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false        // soft delete — don't expose this
    },
},{timestamps:true})
export const Product=mongoose.model("Product",productSchema)