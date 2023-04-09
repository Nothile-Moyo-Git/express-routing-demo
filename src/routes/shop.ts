// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
// import path from "path";
// import rootDir from "../util/path";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Import the products array from the admin file
import { products } from "../controllers/products";

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", (request : Request, response : Response, next : NextFunction) => {

    console.log(products);

    // Read and send the file back to the user
    // response.sendFile(path.join(rootDir, "views/shop.html"));

    // Render the pug template file, we don't need a file extension to do this
    response.render('shop', { prods : products, pageTitle: "Shop", path: "/", hasProducts : products.length > 0 });
});

export default shopRoutes;