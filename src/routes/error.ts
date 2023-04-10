// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
import { getError } from "../controllers/error";

// Create our express router
const errorRoutes = express.Router();

// Implement error router, this captures all requests that don't go straight to a defined route
errorRoutes.get("*", getError);

export default errorRoutes;