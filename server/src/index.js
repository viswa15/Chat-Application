import express from "express";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js"
import {connectDB} from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app,server} from "./lib/socket.js";
import path from "path";

dotenv.config();


const PORT = process.env.PORT;

// const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.VITE_CLIENT_URL || "http://localhost:5173",
        credentials: true
    }
));
app.use("/api/auth",authRoute);
app.use("/api/messages",messageRoute)

// if(process.env.NODE_ENV === "production"){
//     app.use(express.static(path.join(__dirname,"../client/dist")));
//     app.get("*",(req,res)=>{
//         res.sendFile(path.join(__dirname,"../client/dist/index.html"))
//     })
// }

server.listen(PORT,()=>{
    console.log("Server running on port:",PORT);
    connectDB();
})