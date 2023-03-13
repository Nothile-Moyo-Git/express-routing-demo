// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";
import fs from "fs";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Create our express router
const adminRoutes = express.Router();

// Initial middleware response
adminRoutes.get("/add-product", (request : Request, response : Response, next : NextFunction) => {

    // Get the add product HTML page by parsing the file
    // We turn the file into a buffer instance and pass it through to the add-product page
    const data = fs.readFileSync("./views/add-product.html");
    console.log("data is below");
    console.log(data.toString());

    // Define an action and a method for the form
    response.writeHead(200, {"Content-Type" : "text/html"});
    response.write(data.toString());
    response.end();
});

// Handle a response in the body of a request usng middleware
adminRoutes.post("/add-product", (request : Request, response : Response, next : NextFunction) => {

    console.log(request.body.title);
    response.redirect("/");
});


export default adminRoutes;