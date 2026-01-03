const mongoose=require('mongoose');
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    phone: { 
        type: String, 
        unique: true, 
        sparse: true, 
        default: null
    },
    address: { type: String, default: "" },
    // ADD THIS LINE
    college: { type: String, default: "" }, 
    avatar: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);