import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getAllVideos } from '../controllers/video.controller.js';

const router = Router();
router.use(verifyJWT); 

router.route("toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toogle/t/:tweetId").post(toggleTweetLike)
router.route("/videos").get(getAllVideos)

export default router