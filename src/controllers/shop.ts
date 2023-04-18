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

const getCart = ( request : Request, response : Response, next : NextFunction) => {

    response.render("shop/cart", {pageTitle : "Cart"});
};

export { getCart }