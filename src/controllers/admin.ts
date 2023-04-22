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

    console.log("Request body");
    console.log(request.body);

    // Add a new product to the array
    // productsInstance.addProduct({ title : request.body.title }); 

    // Once we've added the product, save it to the messages.json file found in the data folder
    // productsInstance.saveProduct({ title: request.body.title });

    // Redirect to the products page
    response.redirect("/");
};

// Get admin products controller
const getProducts = (request : Request, response : Response, next : NextFunction) => {

    // Get the products from our json file
    const result = productsInstance.getProducts();

    // Render the admin products ejs template
    response.render("admin/products", { pageTitle : "Admin Products", hasProducts : result.length > 0 });
};

export { getAddProduct, postAddProduct, getProducts }; 