import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// Toggle subscription: Subscribe if not already subscribed, otherwise unsubscribe

const toggleSubscription = asyncHandler(async(req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    if(req.user._id.toString() === channelId){
        throw new ApiError(400, "You can not subscribe your own Channel!")
    }

    const exitingSub = await Subscription.findOne({
        subscriber : req.user._id,
        channel : channelId
    })

    if(exitingSub){
        await exitingSub.deleteOne()
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Unsubscribed Successfully")
        )
    } else{
        const newSub = await Subscription.create({
            subscriber : req.user._id,
            channel : channelId
        })
        return res
        .status(201)
        .json(new ApiResponse(200, newSub, "Subscribed succesfully"))
    }
})


const getUserChannelSubscribers = asyncHandler(async(req, res) => {
   // Get all subscribers of a specific channel
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id");
    }

    const subscribers = await Subscription.find({channel: channelId}) // Find all users who have subscribed to this channel.
    .populate("subscriber", "username fullName avater") // all subscribers
    .lean()

})


const getSubscribedChannels = asyncHandler(async(req, res) => {
    // Get all channels a user has subscribed to
    const {subscriberId} = req.params

    if(!isValidObjectId){
        throw new ApiError(400, "Invalid subscriber id")
    }

    const channels = await Subscription.find({subscriber : subscriberId})
        .populate("channel", "username fullName avater") // all channels
        .lean()
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}