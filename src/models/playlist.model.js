import mongoose, {Schema} from "mongoose";

const playlistScema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        videos: [
            { // array of objects
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

export const Playlist = mongoose.model("Playlist", playlistScema)