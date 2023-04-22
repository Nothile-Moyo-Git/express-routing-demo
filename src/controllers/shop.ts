/**
 * 
 * Shop controller.
 * This controller handles the routing for the cart and shop functionality.
 * It also hooks up the "shop" model which can be used to manage our data
 * 
 * @method getShop : (request : Request, response : Response, next : NextFunction) => void
 * @method getCart : (request : Request, response : Response, next : NextFunction) => void
 * @method getCheckout : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Cart from "../models/cart";
import Products from "../models/products";

// Instantiate our products 
const productsInstance = new Products();

// Instantiate the cart
const cartInstance = new Cart();

// Get the shop index page
const getIndex = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/index", { pageTitle : "Shop" });
};

// Get products controller
const getProducts = (request : Request, response : Response, next : NextFunction) => {

    // Get the products from our JSON file
    const result = productsInstance.getProducts();

    // Render the ejs template file, we don't need a file extension to do this
    response.render("shop/product-list", { prods : result, pageTitle: "Shop", path: "/", hasProducts : result.length > 0 });
};

// Get the cart
const getCart = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/cart", { pageTitle : "Your Cart" });
};

// Get the checkout page from the cart
const getCheckout = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/checkout", { pageTitle : "Checkout" });
};

// Get product detail controller
const getProductDetails = ( request : Request, response : Response, next : NextFunction ) => {

    // Render the admin products ejs template
    response.render("shop/product-detail", { pageTitle : "Product Details" });
};


export { getCart, getProducts, getCheckout, getIndex, getProductDetails };