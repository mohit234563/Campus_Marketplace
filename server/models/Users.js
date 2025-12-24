const mongoose=require('mongoose');
const UserSchema= new mongoose.Schema({
    name:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    phone:{type:String,unique:true,default:""},
    address:{type:String,default:""},
    avatar:{type:String,default:""},
    createdAt: { type: Date, default: Date.now }
}

)
module.exports = mongoose.model('User', UserSchema);