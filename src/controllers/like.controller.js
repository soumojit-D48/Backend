import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async(req,res) => {
    const {videoId} = requestAnimationFrame.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const existingLike = await Like.findOne({
        video : videoId,
        likedBy: req.user._id
    })

    if(existingLike){
        await existingLike.deleteOne()
        return res
        .status(200)
        .json(new ApiResponse(200, null, "Video unliked successfully"))
    }
    else{
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res
        .status(201)
        .json(new ApiResponse(201, newLike, "Video liked successfully"));
    }
})

const toggleCommentLike = asyncHandler(async(req,res) => {
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(existingLike){
        await existingLike.deleteOne()
        return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment unliked successfully"));
    }
    else{
        const commentLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res
        .status(201)
        .json(new ApiResponse(201, commentLike, "Comment liked successfully"));
    }
})

const toggleTweetLike = asyncHandler(async(req,res) => {
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(existingLike){
        await existingLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, null, "Tweet unliked successfully"));
    }
    else{
        const tweetLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res
        .status(201)
        .json(new ApiResponse(201, tweetLike, "Tweet liked successfully"));
    }
})

const getLikedVideos = asyncHandler(async(req,res) => {
    const likes = await Like
    .find({
        likedBy: req.user._id,
        video: {
            $exists: true
        }
    })
    .populate("video", "title description thumbnail")
    .lean()

    return res.status(200).json(new ApiResponse(200, likes, "Liked videos fetched successfully"));
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
};