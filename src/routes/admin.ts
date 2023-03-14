// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";
import path from "path";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Create our express router
const adminRoutes = express.Router();

// Initial middleware response
adminRoutes.get("/add-product", (request : Request, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    response.sendFile(path.join(__dirname, "../views/add-product.html"));

});

// Handle a response in the body of a request usng middleware
adminRoutes.post("/add-product", (request : Request, response : Response, next : NextFunction) => {

    console.log(request.body.title);
    response.redirect("/");
});


export default adminRoutes;