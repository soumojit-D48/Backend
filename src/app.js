import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
/* app.use(cors({
    origin: "http://localhost:3000"
}));
*/

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))

app.use(cookieParser())


// routes import

import userRouter from './routes/user.routes.js'


// routes declaration

// app.use("/users", userRouter)
// standerd practice
app.use("/api/v1/users", userRouter) // after /user I pass it to userRouter

// http://localhost:8000/users/register
// /user to /register

// standerd practice
// http://localhost:8000/api/v1/users/register



export {app}