import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

    const { fullname, email, username, password } = req.body

    console.log("email: ", email);

    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is required")
    // }

    if(
        [fullname, email, username, password].some((field) => 
        field ?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists"); 
    }

    // express gave us access of req.body and multer gave us the access of req.files

    const avaterLocalpath = req.files?.avater[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avaterLocalpath){
        throw new ApiError(400,"Avter file is required")
    }

    const avater = await uploadOnCloudinary(avaterLocalpath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avater){ // check again
        throw new ApiError(400,"Avter file is required")
    }

    const user = await User.create({
        fullname,
        avater: avater.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // means which fields need to exclude cause by default all fields included
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered successfully")
    )


})









/*
1) email id
2) password
// means user details from frontend
3) validation - not empty
4) check if user already exists or not : 1) email id 2) password
5) check for images, check for avater
6) upload them to cloudinary, avater
7) create user object - craete enrty in db
8) remove password and refresh token field from response
9) check for user creation
10) return response

 */

// const registerUser = asyncHandler(async (req, res) => {
//     console.log("Request body:", req.body);
//     res.status(200).json({ message: "ok" });
// });








export { registerUser }