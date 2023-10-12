// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
import isAuthenticated from "../middleware/is-auth";

// Import our route handlers
import { getProfilePageController, getEditProfilePageController } from "../controllers/user";

// Define our router object
const userRoutes = express.Router({ strict : true});

// Handle our routes
userRoutes.get("/profile", isAuthenticated, getProfilePageController);
userRoutes.get("/edit-profile", isAuthenticated, getEditProfilePageController);

export default userRoutes;