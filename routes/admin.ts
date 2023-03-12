// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Create our express router
const adminRoutes = express.Router();

// Initial middleware response
adminRoutes.get("/add-product", (request : Request, response : Response, next : NextFunction) => {

    // Define an action and a method for the form
    response.send(`
        <form action="/product" method="POST">
            <input type="text" name="title"/>
            <button type="submit">Add Product</button>
        </form>
    `);
});

// Handle a response in the body of a request usng middleware
adminRoutes.post("/product", (request : Request, response : Response, next : NextFunction) => {

    console.log(request.body.title);
    response.redirect("/");
});



export default adminRoutes;