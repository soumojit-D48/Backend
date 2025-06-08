import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commemtId").patch(updateComment).delete(deleteComment)

export default router