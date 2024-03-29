/**
 * Author : Nothile Moyo
 * Date Created : 14/01/2024
 * License : MIT
 * 
 * Webhook route handler page
 * This is the route handler for the chat and any websockets that we're going to run on the server
 */

// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
import isAuthenticated from "../middleware/is-auth";
import { getChatPageController } from "../controllers/websocket";

// Define our router object
const socketRoutes = express.Router({ strict : true});

// Handle our routes
socketRoutes.get("/chat", isAuthenticated, getChatPageController);

// Export our routes to the index file
export default socketRoutes;