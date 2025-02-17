import express from "express";

const router = express.Router();

import {registerController,loginController,logoutController,updateProfileController,checkAuth} from "../controllers/auth.controller.js";
import {protectedRoute} from "../middleware/auth.middleware.js";


router.post("/signup",registerController)

router.post("/login",loginController)

router.post("/logout",logoutController)

router.put("/update-profile",protectedRoute, updateProfileController)

router.get("/check",protectedRoute,checkAuth);

export default router;