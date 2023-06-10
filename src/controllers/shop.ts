/**
 * 
 * Shop controller.
 * This controller handles the routing for the cart and shop functionality.
 * It also hooks up the "shop" model which can be used to manage our data
 * 
 * @method getIndex : ( request : Request, response : Response, next : NextFunction ) => void
 * @method getShop : ( request : Request, response : Response, next : NextFunction ) => void
 * @method getCart : ( request : Request, response : Response, next : NextFunction ) => void
 * @method getCheckout : ( request : Request, response : Response, next : NextFunction ) => void
 * @method getOrders : ( request : Request, response : Response, next : NextFunction ) => void
 * @method getProductDetails : ( request : Request, response : Response, next : NextFunction ) => void
 */

// Extend the request object in order to set variables in my request object
interface UserInterface {
    id : number,
    name : string,
    email : string
}

interface RequestWithUserRole extends Request{
    User ?: UserInterface
}

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Products from "../models/products";

// Instantiate our products 
const productsInstance = new Products();

// Get the shop index page
const getIndex = ( request : RequestWithUserRole, response : Response, next : NextFunction ) => {

    response.render("shop/index", { pageTitle : "Shop" });
};

// Get products controller
const getProducts = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Render the products page async
    const getProductsAsync = async() => {

        // Get the result of the SQL query
        const result = await productsInstance.fetchAll( request.User.id );

        // Render the ejs template file, we don't need a file extension to do this
        response.render("shop/product-list", { prods : result, pageTitle: "Shop", path: "/", hasProducts : result.length > 0 });
    };

    getProductsAsync();
};

// Get the orders
const getOrders = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/orders", { pageTitle : "Orders" });
};

// Get the checkout page from the cart
const getCheckout = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/checkout", { pageTitle : "Checkout" });
};

// Get product detail controller
const getProductDetails = ( request : Request, response : Response, next : NextFunction ) => {

    // Get product details async
    const getProductDetailsAsync = async() => {

        const result = await productsInstance.getProductById( request.params.id );

        let hasValue : boolean;
        result.length > 0 ? hasValue = true : hasValue = false;
    
        // Render the admin products ejs template
        response.render("shop/product-detail", { hasProduct : hasValue, productDetails : result[0], pageTitle : "Product Details" });
    };

    getProductDetailsAsync();

};


export { getProducts, getCheckout, getIndex, getOrders, getProductDetails };