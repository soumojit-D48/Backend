// require('dotenv').config({path: './env'})
import dotenv from "dotenv"

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({ path: './env' })

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Error", error);
            throw error
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`);

        })
    })
    .catch((err) => {
        console.log("MONGO DB connection failed !!!", err);

    })




// import express from "express";

// const app = express()

// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error) => {
//             console.log("Error", error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on Port
//                 ${process.env.PORT}`);
//         })
//     } catch(error){
//         console.log("ERROR: ",error);
//         throw error
//     }
// })()

// // connectDB()




// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";

// dotenv.config({ path: './.env' });  // ← check your filename!

// const app = express();

// (async () => {
//     try {
//         console.log("Connecting to MongoDB...");
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log("✅ MongoDB connected");

// app.on("error", (error) => {
//     console.log("App error:", error);
//     throw error;
// });

// app.listen(process.env.PORT, () => {
//     console.log(`✅ Server running on port ${process.env.PORT}`);
// });
//     } catch (error) {
//         console.log("ERROR during startup:", error);
//         process.exit(1);
//     }
// })();
