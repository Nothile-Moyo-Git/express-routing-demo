// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
// import path from "path";
// import rootDir from "../util/path";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Create our express router
const errorRoutes = express.Router();

// Implement error router, this captures all requests that don't go straight to a defined route
errorRoutes.get("*", (request : Request, response : Response, next : NextFunction) => {

    // If the page has a 404 error, then output an error page instead of crashing the server
    response.render('404', { pageTitle: "Error" });

});

export default errorRoutes;