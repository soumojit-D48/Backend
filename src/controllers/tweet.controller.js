import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async(req, res) => {
    const { content } = req.body

    if(!content){
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = Tweet.create({
        content,
        owner: req.user._id
    })
    
    return res
    .status(200)
    .json(201, tweet, "Tweet created successfully")
})

const getUserTweets = asyncHandler(async(req, res) => {
    const { userId } = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    const tweets = await Tweet.find({owner: userId}) 
    // Find all documents in the Tweet collection, without any condition

    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async(req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    tweet.content = content || tweet.content
    await tweet.save()

    return res
    .status(200)
    .json(new ApiResponse(200, tweet,  "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async(req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if(tweet.owner.toString() !== req.user._id){
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    await tweet.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};