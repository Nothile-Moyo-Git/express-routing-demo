/**
 * Products controller
 * Handles requests and routing 
 */

interface Product {
    title : string
}

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Add product controller
const getAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    // response.sendFile(path.join(rootDir, "views/add-product.html"));
    response.render("add-product", { pageTitle: "Add Product", path: "/admin/add-product" });

};

const products : Product[] = [];

const postAddProduct = (request : Request, response : Response, next : NextFunction) => {

    products.push({ title: request.body.title });
    response.redirect("/");
}


export { getAddProduct, products, postAddProduct };