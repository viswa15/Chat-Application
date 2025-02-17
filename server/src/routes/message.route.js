import express from "express";
import {protectedRoute} from "../middleware/auth.middleware.js";
import {getMessages, getUsersController, sendMessage} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",protectedRoute,getUsersController);

router.get("/:id",protectedRoute,getMessages);

router.post("/send/:id",protectedRoute,sendMessage);

export default router;