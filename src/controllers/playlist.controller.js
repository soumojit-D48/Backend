import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async(requestAnimationFrame,res) => {
    const {name , description} = req.body

    if(!name){
        throw new ApiError(400, "Playlist name is required")
    }

    const playlist = await Playlist.create({
        name, 
        description,
        owner: req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfullY"))
})

const getUserPlaylists = asyncHandler(async(req,res) => { //  all playlist of user
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    const playlist = await Playlist
    .find({
        owner: userId
    })
    .populate("videos")

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
})

const getPlaylistById = asyncHandler(async(req, res) => { // get a particuler playlist not all 
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist
    .findById(playlistId)
    .populate("videos")

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async(req, res) => {
    const { playlistId, videoId } = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video id");
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(Playlist.videos.includes(videoId)){
        throw new ApiError(409, "Video already in playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res
    .status(200)
    .json(200, playlist, "Video added to Playlist")
})

const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    playlist.videos = playlist.videos.filter((vid) => {
        return vid.toString() !== videoId
        // If vid.toString() does not match videoId, it will be kept.
        // If it matches, it will be removed.
    })

    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist"));
})  

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
    const { name , description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(name) playlist.name = name
    if(description) playlist.description = description

    await Playlist.save()

    return res
    .status(200) 
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist, 
  deletePlaylist,
  updatePlaylist,
};