import { Router } from "express";
import { changeCurrentPassword, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, registerUser, updateAccountDetails, updateUserAvater, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avater",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), // Returns middleware that processes multiple files associated with the given form fields.
    registerUser) // if /register will be hit then We call registerUser


router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(varifyJWT, logoutUser)
// you can add as many as middleware

    /*
    // varifyJWT -> middleware
    // logoutUser -> next
    // imp** dont execute the fn() just give the refrence

    setTimeout(sayHello, 2000);   // ✅ correct – pass the function // it execute later
    setTimeout(sayHello(), 2000); // ❌ wrong – calls immediately  
    */

    router.route("/refresh-token").post(refreshAccessToken)

    router.route("/change-password").post(varifyJWT, changeCurrentPassword)

    router.route("/current-user").get(varifyJWT, getCurrentUser)

    router.route("/update-account").patch(varifyJWT, updateAccountDetails)

    router.route("/avater").patch(varifyJWT, upload.single("avater"), updateUserAvater)

    router.route("/cover-image").patch(varifyJWT, upload.single("coverImage"), updateUserCoverImage)

    router.route("/c/:username").get(varifyJWT,getUserChannelProfile)

    router.route("/history").get(varifyJWT, getWatchHistory)


export default router