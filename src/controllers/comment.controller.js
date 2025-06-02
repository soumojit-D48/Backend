import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjId = (id) => {
    return mongoose.Types.ObjectId.isValid(id)
}

const addComment = asyncHandler(async(req,res) => {
    const { videoId } = req.perams
    const { content } = req.body
    const ownerId = req.user?._id // after auth middleware

    if (!isValidObjId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    } 

    if(!content || !(content.trim())){
        throw new ApiError(400, "Comment text required")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: ownerId
    })

    return res
    .status(201)
    .json(new ApiResponse(
            201,
            comment,
            "Comment added successfully"
        )
    )
})

const getVideoComments = asyncHandler(async(requestAnimationFrame, res) => {

})

export {
    getVideoComments,
    addComment,

}