// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Products from "../models/products";

// Instantiate our products 
const productsInstance = new Products();

// Add product controller
const getAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    response.render("admin/add-product", { pageTitle: "Add Product", path: "/admin/add-product" });
};

// Post add product controller
const postAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Add a new product to the array
    productsInstance.addProduct({ title : request.body.title });

    // Once we've added the product, save it to the messages.json file found in the data folder
    productsInstance.saveProduct({ title: request.body.title });

    // Redirect to the products page
    response.redirect("/");
}

export { getAddProduct, postAddProduct }; 