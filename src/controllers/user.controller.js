import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessTokenRefreshTokens = async(userId) => {
    try {
        // find user
        const user = await User.findById(userId)
        // generate access and refresh token
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // we gave the accessToken to the user
        // But we store the refreshToken in db
        
        user.refreshToken = refreshToken
        // in mongoose user model password is a required field but here use update with only one field refreshToken
        await user.save({validateBeforeSave:  false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong wrong while generating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

    const { fullName, email, username, password } = req.body

    // console.log(req.body); // should print
    

    // console.log("email: ", email);

    // if(fullName === ""){
    //     throw new ApiError(400,"fullName is required")
    // }

    if(
        [fullName, email, username, password].some((field) => 
        field ?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }] // if the email or username already exists 
    })

    if(existedUser){ // then throw an error
        throw new ApiError(409, "User with email or username already exists"); 
    }

    // express gave us access of req.body and multer gave us the access of req.files

    const avaterLocalpath = req.files?.avater[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    // console.log(req.files);

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }
    
    if(!avaterLocalpath){
        throw new ApiError(400,"Avter file is required")
    }

    const avater = await uploadOnCloudinary(avaterLocalpath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avater){ // check again
        throw new ApiError(400,"Avter file is required")
    }

    const user = await User.create({
        fullName,
        avater: avater.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select( // .select -ve means exclude some field 
        "-password -refreshToken" // means which fields need to exclude cause by default all fields included
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered successfully")
    )



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

})


const loginUser = asyncHandler(async (req, res) => {


    const {email,username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400,"username or email is required!")
    }

    const user = await User.findOne({ // user is new user
        $or: [{username},{email}] // User is the user already in db we just find it in db
    })
    console.log("Found user:", user);

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessTokenRefreshTokens(user._id)

    // now see one thing in the user the refreshToken is empty cause we call the genAcRefToken method later but before it was empty

    // so what can we do, we can update the user obj's refreshToken

    const loggedInUser = await User.findById(user._id).select("-password  -refreshToken")

    // send cookies

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200, // statuscode
            { // data 
                user: loggedInUser,accessToken,
                refreshToken
            },
            // messege
            "User logged in Successfully"
        )
    )


     /* 
   req body -> data
   1)user details
    //email and password
    username or email
    2) find the user
    3) password check
    4) access, refresh token 
    5) send cookie
   */

})


const logoutUser = asyncHandler(async(req, res) => {

    /*
    So what to do here when user logout
    1) cookies must remove from browser
    2) remove refreshToken 

    *** If the refresh token is valid:
    Backend creates a new access token
    Sends it back as a new cookie ***

    so if refreshToken removed then there is no way to get new access token so user didn't access

    No refresh Token -> No access token(after it expires) 
    (access token is short term, so after expire we didnt get the access token cause we remove refresh token )
    */

    // User.findById(user) // but how can we get user, Before in login we have access cause he enter his email, username, password
    // but its funny why again told user to send me email...
    // so anyone can logout your acc

    // After adding the auth middleware--->

    // req.user._id // Before we cant this but now after using the auth middleware we have access of user

    // we can use findbyId but then we have to do many things get ref token save , validateBeforeSave: false that why you can use it

    User.findByIdAndUpdate(
        await req.user._id, // find
        {
            $set: { // mongodb oparetor
                refreshToken: undefined
            }
        },
        { // we want updated value undefined not the old ref token
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie(accessToken)
    .clearCookie(refreshToken)
    .json( new ApiResponse(200, {}, "User logged Out"))
})

/*
Access Token - Short lived, not stored in db
Refresh Token - Long lived, stored in db
When access token expires, the frontend sends the refresh token to the backend to validate user (login), once again.
 */

/* 
after 401 request when access token expires, hit an endpoint and refresh the access token means get a new access token.

with the request send the refresh token and match the refresh token with db refresh token if same then start the session again
  */

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }
    // Have to decode the token the token db is raw but user have the token is encrypted so we have to decode it then have to comare with db ref token

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        // Match incomingRefreshToken and after decoded it the user we found in db that user's refresh Token already saved(generateAccessTokenRefreshTokens())
        //  so we have to check this user is the user in db or not
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is already used")
        }
        // now all set generate new access and refresh token
    
        const {accessToken, newRefreshToken} = await generateAccessTokenRefreshTokens(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})


const changeCurrentPassword = asyncHandler(async(req,res) => {
    // here we haven't the headache of check if user already logged in or not, have cookies or not cause we have jwt varify middleware in route we just inject the middleware

    const {oldPassword, newPassword} = req.body // , confPassword

    // if(!(newPassword === confPassword)){

    // }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword) // it compare with new password by this.password

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword // set
    user.save({validateBeforeSave: false}) // save

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "password chnaged successfully"))

})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
}) 


const updateAccountDetails = asyncHandler(async() => { 
    // when you update a file write diff controllers and diff endpoint(route) if we save the full user then it not need

    const {fullName, email} = req.body

    if(!(fullName || email)){
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, // fullName : fullName it is also ok
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user,"Account details update successfully"))

})


const updateUserAvater = asyncHandler(async(req, res) => {
    const avaterLocalPath = req.file?.path

    if(!avaterLocalPath){
        throw new ApiError(400, "Avater file is missing")
    }

    const avater = await uploadOnCloudinary(avaterLocalPath)

    if(!avater.url){
        throw new ApiError(400, "Error while uploading avater")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avater: avater.url
            }
        },
        {new: true}
    ).select("-password")

    return res.
    status(200)
    .json(new ApiResponse(200, user, "Avater updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading Cover Image")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvater,
    updateUserCoverImage
}