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

const updateComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    const {content} = req.body

    if(!isValidObjId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content?.trim()){
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.findId(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You can update only your own comments");
    }

    comment.content = content.trim()

    await Comment.save({validateBeforeSave : false}) // false cause we update only one field

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "Comment added successfully"
    ))
})

const deleteComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params

    if(!isValidObjId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findId(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.body._id.toString()){
        throw new ApiError(403, "You can delete only your own comments");
    }

    await comment.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));

})

const getVideoComments = asyncHandler(async(requestAnimationFrame, res) => {
    const {videoId} = req.params // 	Route parameters (in URL path) // /video/123 → req.params.videoId === "123"
    const {page = 1, limit = 10} = req.query // req.query holds the query parameters from the URL. // GET /video/123?page=2&limit=5

    const skip = ((Number(page) - 1) * Number(limit))

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",  // target collection
                localField: owner,
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avater: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: {createdAt: -1} // Sorts the comments so the newest ones come first.
        },
        {
            $skip: {skip} // Skips the first skip number of results.
        },
        {
            $limit: Number(limit) // Limits the number of comments returned to limit
        }
    ]

    const [comments, total] = await Promise([ // total -> total comments
        Comment.aggregate(pipeline),
        Comment.conuntDocuments({video: videoId})
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                comments,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
                totalComments: total
            },
            "Comments fetched successfully"
        )
    )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
    
}