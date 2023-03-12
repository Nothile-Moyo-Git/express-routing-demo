// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", (request : Request, response : Response, next : NextFunction) => {
    response.send("<h1>Hello From Express</h1>");
});

export default shopRoutes;