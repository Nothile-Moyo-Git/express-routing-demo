// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";
// import path from "path";
// import rootDir from "../util/path";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Interface for our product types
interface Product {
    title : string
}

// Create our express router
const adminRoutes = express.Router();

const products : Product[] = [];

// Initial middleware response
adminRoutes.get("/add-product", (request : Request, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    // response.sendFile(path.join(rootDir, "views/add-product.html"));
    response.render("add-product", { pageTitle: "Add Product", path: "/admin/add-product" });

});

// Handle a response in the body of a request usng middleware
adminRoutes.post("/add-product", (request : Request, response : Response, next : NextFunction) => {

    products.push({ title: request.body.title });
    response.redirect("/");
});

export { products };
export default adminRoutes;