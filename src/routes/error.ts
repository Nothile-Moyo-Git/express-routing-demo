/**
 * Author : Nothile Moyo
 * Date Created : 31/10/2023
 * License : MIT
 * 
 * Error Router handler page
 * Handles our fallback routes with a 404 page and a 500 page for server issues
 */

// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
import { get404PageController, get500PageController } from "../controllers/error";

// Create our express router
const errorRoutes = express.Router();

// Handle a 500 page in case a server request doesn't work
errorRoutes.get("/500", get500PageController);

// Implement error router, this captures all requests that don't go straight to a defined route
errorRoutes.get("*", get404PageController);

export default errorRoutes;