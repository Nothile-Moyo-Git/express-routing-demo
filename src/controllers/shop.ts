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

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Cart from "../models/cart";
import Products from "../models/products";
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";

// Instantiate our products 
const productsInstance = new Products();

// Get the shop index page
const getIndex = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/index", { pageTitle : "Shop" });
};

// Get products controller
const getProducts = (request : Request, response : Response, next : NextFunction) => {

    // Render the products page async
    const getProductsAsync = async() => {

        // Get the result of the SQL query
        const result : [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]] = await productsInstance.fetchAll();

        // Convert our result from a RowDataPacket to an array
        const resultsArray = JSON.parse( JSON.stringify(result[0] ));

        // Render the ejs template file, we don't need a file extension to do this
        response.render("shop/product-list", { prods : resultsArray, pageTitle: "Shop", path: "/", hasProducts : resultsArray.length > 0 });
    };

    getProductsAsync();
};

// Get the cart
const getCart = ( request : Request, response : Response, next : NextFunction ) => {

    // Instantiate the cart
    const cartInstance = new Cart();

    // Output the cart instance
    cartInstance.getProducts();

    // Render the cart page
    response.render("shop/cart", { 
        pageTitle : "Your Cart", 
        hasProducts : cartInstance.cartItems.length > 0, 
        products : cartInstance.cartItems,
        totalPrice : cartInstance.totalPrice
    });
};

const postCartDelete = ( request : Request, response : Response, next : NextFunction ) => {

    // Instantiate the cart
    const cartInstance = new Cart();

    // Get the product id in order to delete it from the Cart
    const productId = request.body.productId;

    console.clear();

    // Execute remove item from cart method
    cartInstance.removeCartItem(productId);

    // Reload the page
    response.redirect("/cart");
};

// Handle the post request for the cart
const postCart = ( request : Request, response : Response, next : NextFunction ) => {

    // Get the params ID 
    Cart.addProduct( request.body.productId );

    // Redirect to the cart page
    response.redirect("/cart");
}

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
        result ? hasValue = true : hasValue = false;
    
        // Render the admin products ejs template
        response.render("shop/product-detail", { hasProduct : hasValue, productDetails : result, pageTitle : "Product Details" });
    };

    getProductDetailsAsync();

};


export { getCart, postCart, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails };