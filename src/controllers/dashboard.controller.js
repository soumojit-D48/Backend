import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    //  Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const {userId} = req.user._id

    const totalVideos = await Video.countDocuments({owner : userId})
    const totalSubs = await Subscription.countDocuments({channel : userId})
    const videos = await Video.find({owner : userId}, "_id views")

    const videoIds = videos.map((vid) => vid._id)
    const totalViews = await videos.reduce((acc, cur) => acc + cur.views, 0) // here acc = 0 initial val
    // array.reduce((accumulator, currentValue) => { ... }, initialValue)
    const totalLikes = await Like.countDocuments({
        vid: {
            $in: videoIds
        }
    })

    const stats = {totalVideos, totalSubs, totalViews, totalLikes}

    return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
})


const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel

    const userId = req.user._id

    const videos = await Video.find({owner: userId}).sort({createdAt: -1}) 
    // descending order -> newest videos first

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats,
    getChannelVideos
}