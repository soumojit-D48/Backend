import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from"express"

const app = express();

const connectDB  = async () => {
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // await mongoose.connect(process.env.MONGODB_URI + "/" + DB_NAME);

        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
        // app.on("error", (error) => {
        //     console.log("App error:", error);
        //     throw error;
        // });

        // app.listen(process.env.PORT, () => {
        //     console.log(`✅ Server running on port ${process.env.PORT}`);
        // });
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1)
    }
}


export default connectDB
