import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const varifyJWT = asyncHandler(async(req, _,next) => { // (async(req, res,next)
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        /*
        Go to user.model.js
        there when we create an access token there in payload there are so many information of user 
        id,email,fullname,username
    
        so we have to decode it cause we need the id from this access token
        */ 
    
        // you can genarete token but only who have the ACCESS_TOKEN_SECRET he can decode it
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") // in model we use _id // exclude -ve
    
        if(!user){
            // discuss about frontend
            throw new ApiError(401,"Invalid access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})