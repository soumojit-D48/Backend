import mongoose, {Schema} from "mongoose";
import { jwt } from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true 
            // index true means searching field enable (optimize)
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avater: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String, 
        }
    },{timestamps:true})

// userSchema.pre("save", () => {})
    // here if we use arrow function then we didn't have the reference of this its doesn't know the context

// pre hook change somehting before "save" or anything
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next(); // here is that check if password was modified then only enter or return form here
    this.password = bcrypt.hash(this.password, 10)
    // The salt to be used in encryption. If specified as a number then a salt will be generated with the specified number of rounds and used.
    next()
    // here  problem if everytime we save its save the password like if someone chnage the profile pic its save the password
    // but we want it change the password or save the password then user login or change a new password
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    // Internally hashes the input and checks if it matches the stored hash.
}

// both are JWT token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign( // here you can use async await but without it its also works
        { // payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign( // here you can use async await but without it its also works
        { // payload
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export  const User = mongoose.model("User",userSchema)