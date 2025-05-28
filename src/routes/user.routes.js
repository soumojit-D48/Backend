import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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

// varifyJWT -> middleware
// logoutUser -> next
// imp** dont execute the fn() just give the refrence

/* setTimeout(sayHello, 2000);   // ✅ correct – pass the function // it execute later
setTimeout(sayHello(), 2000); // ❌ wrong – calls immediately */ 

export default router