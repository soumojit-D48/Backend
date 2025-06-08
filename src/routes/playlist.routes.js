import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT)

router.route("/").post(createPlaylist)

router
    .route("/:playlsitId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

router.route("/add/:videoId/playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").delete(removeVideoFromPlaylist)

router.route("user/:userId").get(getUserPlaylists)

export default router