/**
 * Products controller
 * Handles requests and routing 
 * This controller uses the products model on order to handle functionality
 * 
 * @method getAddProduct : (request : Request, response : Response, next : NextFunction) => void
 * @method postAddProduct : (request : Request, response : Response, next : NextFunction) => void
 * @method getProducts : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Products from "../models/products";

// Instantiate our products 
const productsInstance = new Products();

// Add product controller
const getAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    response.render("add-product", { pageTitle: "Add Product", path: "/admin/add-product" });
};

// Post add product controller
const postAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Add a new product to the array
    productsInstance.addProduct({title : request.body.title});

    // Once we've added the product, save it to the messages.json file found in the data folder
    productsInstance.saveProduct({title: request.body.title});

    // Redirect to the products page
    response.redirect("/");
}

// Get products controller
const getProducts = (request : Request, response : Response, next : NextFunction) => {

    // Render the pug template file, we don't need a file extension to do this
    response.render('shop', { prods : productsInstance.products, pageTitle: "Shop", path: "/", hasProducts : productsInstance.products.length > 0 });
};

export { getAddProduct, postAddProduct, getProducts };