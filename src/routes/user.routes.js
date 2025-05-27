import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avater",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount: 1
        }
    ]), // Returns middleware that processes multiple files associated with the given form fields.
    registerUser) // if /register will be hit then i call registerUser






export default router