import express from "express";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js"
import {connectDB} from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app,server} from "./lib/socket.js";

dotenv.config();


const PORT = process.env.PORT;

// const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
// --- Create a whitelist of allowed domains ---
const whitelist = [
    'http://localhost:5173', // For local development
    'https://chat-application-five-swart.vercel.app' // Your production frontend
];

const corsOptions = {
    origin: function (origin, callback) {
        // The 'origin' is the URL of the site making the request (e.g., your Vercel URL)
        // The '|| !origin' part allows requests that don't have an origin, like from Postman or mobile apps.
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Block the request
        }
    },
    credentials: true
};

// --- Use the new options in your app ---
app.use(cors(corsOptions));
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