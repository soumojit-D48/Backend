import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async(req, res) => {
    //  const { page = 1, limit = 10, query , sortBy = "createdAt", sortType = "desc", userId } = req.query;
    const { 
    page = 1,           // default page is 1 if not provided
    limit = 10,         // default limit is 10
    query,              // search keyword
    sortBy = "createdAt", // field to sort by (default: createdAt)
    sortType = "desc",  // sort direction (default: descending)
    userId              // optional filter by user
    } = req.query;

    const filter = {}
    if(query){
        filter.title = {
            $regex : query, // Find documents where the field contains a string that matches this pattern.
            $options : "i"  // "i" stands for case-insensitive match. // fun -> funny, FUN, function
        }
    }
    // If a search query is passed (e.g., from URL query string),
    // then match titles that contain that query using case-insensitive regex.

    if(userId && isValidObjectId(userId)){
        filter.owner = userId
    }

    /*  | Option | Meaning                |
        | ------ | ---------------------- |
        | `"i"`  | Case-insensitive match |
        | `"m"`  | Multi-line mode        |
        | `"s"`  | Dot matches newline    |
        | `"x"`  | Ignore whitespace      | */

    const sortOptions = {}
    sortOptions[sortBy] = sortBy === "asc" ? 1 : -1

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "username, email")

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async(req, res) => {
    const {title, description} = req.body

    if(!title){
        throw new ApiError(400, "Title is required");
    }

    const videoLocalPath = req.files?.video?.[0].path
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "Video and thumbnail are required");
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoUpload.url || !thumbnailUpload){
        throw new ApiError(500, "Error uploading files to Cloudinary");
    }

    const video = await Video.create({
        title,
        description,
        videoFile : videoUpload.url,
        thumbnail : thumbnailUpload.url,
        owner : req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(201, video, "Video published successfully"));
})

const getVideoById  = asyncHandler(async(req, res) => {
    const videoId = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId).populate("owner", "username email")

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    const {title, description} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this video");
    }

    if(title) video.title = title
    if(description) video.description = description

    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
         throw new ApiError(403, "You are not authorized to delete this video");
    }

    await video.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    } 

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id){
        throw new ApiError(403, "You are not authorized to update this video");
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`));
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};


