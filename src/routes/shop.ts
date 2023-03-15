// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
import path from "path";
import rootDir from "../util/path";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", (request : Request, response : Response, next : NextFunction) => {

    // Read and send the file back to the user
    response.sendFile(path.join(rootDir, "views/shop.html"));
});

export default shopRoutes;