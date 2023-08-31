// Import express router for the admin and shop pages
// This file is for the output routes
// This is the authentication router, first it creates an instance of express router model
// It handles routes by executing functions passed through from the auth controller
// Note: Please use the same name for your controller
import express from "express";

// Get the controller so we can handle all of our requests
import { getLoginPageController } from "../controllers/auth";

// Define the object for our router which we pass through to the index file
const authRoutes = express.Router();

authRoutes.get("/login", getLoginPageController);

export default authRoutes;