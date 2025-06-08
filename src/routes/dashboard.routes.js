import { Router } from "express";

import { 
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controller";

import { varifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.use(varifyJWT)

router.route("/stats").get(getChannelStats)
router.route("/videos").get(getChannelVideos)

export default router