import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    fullname: {
        type: String,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String 
    },
    refreshToken: { type: String },
}, { timestamps: true })

// 2. Encrypt password before saving
UserSchema.pre("save", async function () {
    // If password isn't modified, just return early to stop execution
    if (!this.isModified('password')) return;
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    
    // DO NOT CALL next() HERE
})

// 3. Custom methods
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)   
}

UserSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

UserSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}


export const User = mongoose.model('User', UserSchema)