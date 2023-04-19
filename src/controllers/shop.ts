/**
 * 
 * Shop controller.
 * This controller handles the routing for the cart and shop functionality.
 * It also hooks up the "shop" model which can be used to manage our data
 * 
 * @method getCart : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Cart from "../models/cart";

// Instantiate the cart
const cartInstance = new Cart();

// Get the shop index page
const getShop = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("/", {pageTitle : "Shop"});
};

// Get the cart
const getCart = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/cart", {pageTitle : "Cart"});
};

// Get the checkout page from the cart
const getCheckout = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/checkout", {pageTitle : "Checkout"});
};

export { getCart, getCheckout, getShop };