/**
 * Author : Nothile Moyo
 * Date Created : 30/10/2023 ( Happy Halloween! )
 * License : MIT 
 * 
 * Shop controller.
 * This controller handles the routing for the cart and shop functionality.
 * It also hooks up the "shop" model which can be used to manage our data
 * This controller also handles the "order" model which is used during cart submissons
 * 
 * @method getIndex : (request : Request, response : Response, next : NextFunction) => void
 * @method getProducts : () => void
 * @method getShop : (request : Request, response : Response, next : NextFunction) => void
 * @method getCart : (request : Request, response : Response, next : NextFunction) => void
 * @method getCheckout : (request : Request, response : Response, next : NextFunction) => void
 * @method getOrders : (request : Request, response : Response, next : NextFunction) => void
 * @method getProductDetails : (request : Request, response : Response, next : NextFunction) => void
 * @method postCart : (request : Request, response : Response, next : NextFunction) => void
 * @method postOrderCreate : (request : Request, response : Response, next : NextFunction) => void
 * @method postCartDelete : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { NextFunction, Response } from 'express';
import Product from "../models/products";
import { ObjectId } from 'mongodb';
import User from "../models/user";
import Order from "../models/order";
import { ExtendedRequestInterface } from '../@types';
import CustomError from '../models/error';
import path from 'path';
import fs from 'fs';

// Get the shop index page
const getIndex = ( request : ExtendedRequestInterface, response : Response ) => {

    // For now, redirect to the products page
    response.redirect("/products");
};

// Get products controller
const getProducts = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Check if the user is logged in so we determine which menu we want to show, if we don't do this we always show the logged in menu even if we're not
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    try{

        // Find the product. If we need to find a collection, we can pass the conditionals through in an object
        const products = await Product.find()
        .select("title price _id description image")
        .populate("userId", "name");

        // Render the products view
        response.render("pages/shop/product-list", { 
            prods : products, 
            pageTitle: "My Products", 
            path: "/", 
            hasProducts : products.length > 0,
            isAuthenticated : isLoggedIn === undefined ? false : true,
            csrfToken : csrfToken
        });

    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 500);

        console.log(error);

        return next(error);
    }
};

const getInvoiceController = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    const params = request.params;
    const orderId = params.orderId;

    // Generate appropriate pathname
    const fileName = "invoice-" + orderId + ".pdf";
    const filePath = path.join(__dirname, `../data/invoices/invoice-${orderId}.pdf`);

    try{

        // Get the order data so we can find the user and make a comparison
        const order = await Order.findOne({_id : orderId});

        const orderUser = order.user;
        const sessionUser = request.session.user;
    
        // Is the user valid?
        const isUserValid = orderUser._id.toString() === sessionUser._id.toString();

        if (isUserValid === true) {

            // Get filedata
            const pdfData = fs.readFileSync(filePath);
            
            // Send the PDF to the browser
            response.setHeader("Content-Type", "application/pdf");

            // Content-Disposition allows us to decide how we want to render it in the browser
            // Note: If you change "inline" to "attachment" then instead of opening in a new browser, the file is downloaded
            response.setHeader("Content-Disposition", `inline; filename=${fileName}`);

            response.send(pdfData);
        }
    
    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 400);

        console.log(error);

        return next(error);
    }
};

// Get the orders
const getOrders = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get our CSRF token if we don't have one already
    const csrfToken = request.session.csrfToken;

    // Get the user from the request session
    const user = request.session.user;

    try{

        // Query the orders in the backend
        const orders = await Order.find({"user._id" : user === undefined ? null : user._id})
        .select("_id totalPrice orderItems createdAt user");

        // Render the view page
        response.render("pages/shop/orders", { 
            pageTitle : "Orders", 
            orders : orders, 
            hasOrders : orders.length > 0,
            isAuthenticated : isLoggedIn === undefined ? false : true,
            csrfToken : csrfToken
        });

    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 500);

        console.log(error);

        return next(error);
    }
};

// Get the checkout page from the cart
const getCheckout = ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our CSRF token if we don't have one already
    const csrfToken = request.session.csrfToken;

    response.render("pages/shop/checkout", { 
        pageTitle : "Checkout",
        isAuthenticated : true,
        csrfToken : csrfToken
    });
};

// Get product detail controller
const getProductDetails = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get our CSRF token if we don't have one already
    const csrfToken = request.session.csrfToken;

    // Check if our Object id is valid in case we do onto a bad link
    // This is more of a pre-emptive fix for production builds
    const isObjectIdValid = ObjectId.isValid(request.params.id);

    // Create a new product Id and guard it
    const productId = isObjectIdValid ? new ObjectId(request.params.id) : null;

    try{

        // Get single product details
        const singleProduct = isObjectIdValid ? await Product.findById(productId) : null;

        // Check if we have products
        const hasProduct = singleProduct !== null;

        // Render the admin products ejs template, make sure it's for the first object we get since Mongoose returns an array of BSON objects
        response.render("pages/shop/product-detail", { 
            hasProduct : hasProduct, 
            productDetails : singleProduct,
            pageTitle : "Product details",
            isAuthenticated : isLoggedIn === undefined ? false : true,
            csrfToken : csrfToken
        });
    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 500);

        console.log(error);

        return next(error);
    }
};

// Get the cart and all the products inside of it
const getCart = async ( request : ExtendedRequestInterface, response : Response ) => {

    // Instantiate the User that we have
    const user = request.session.user;

    // Get the cart from the session, we store it in the session with the userId so that 
    const cart = request.session.cart;

    // Get our CSRF token if we don't have one already
    const csrfToken = request.session.csrfToken;

    // Check if we have products that we can render on the tempalate
    const hasProducts = cart.items.length > 0 ? true : false;

    // Check if we have any users that work with the session
    const hasUser = user !== undefined;
 
    // Render the admin products ejs template
    response.render("pages/shop/cart", { 
        hasProducts : hasProducts, 
        products : hasUser === true ? cart.items : [],
        pageTitle : "Your Cart",
        totalPrice : cart.totalPrice,
        isAuthenticated : true,
        csrfToken : csrfToken
    });
};

// Add a new product to the cart using a post request
// Acts as an add product handler
const postCart = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Instantiate the user that we have
    const user = request.session.user;

    // Get product information based on the product Id
    const productId = new ObjectId(String(request.body.productId).replace(/\/$/, ""));

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");

    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    try{

        // Get product details
        const product = await Product.findOne({_id : productId})
        .select("title price _id");

        if (user !== undefined && isCSRFValid === true) {

            // Create a new instance of our user to gain access to mongoose static methods
            const userInstance = new User(user);
        
            // Set the product details into a new object
            const productDetails = { title : product.title, price : product.price, _id : product._id };

            // This is our new cart
            userInstance.addToCart(productDetails);

            // Update the document in Mongoose as the save method when we instantiate it isn't flexible enough
            await User.updateOne({_id : new ObjectId(user._id)},{cart : userInstance.cart});

            // Update the user in the session so we don't have to restart the server after adding an item to our cart
            request.session.user = userInstance;

            // Update the user in the session
            request.session.cart = {
                items : userInstance.cart.items,
                totalPrice : userInstance.cart.totalPrice,
                userId : userInstance.cart?.userId
            };
        }

    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 500);

        console.log(error);

        return next(error);
    }

    // If our csrf check fails then output a separate response, otherwise, go to the cart page
    if (isCSRFValid === true) {

        // Redirect to the cart page
        response.redirect("cart");

    }else{

        response.status(403).send("CSRF protection failed!");
    }
}

// Delete an item from the cart using cart item
const postCartDelete = (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Get product ID string
    const productId = request.body.productId.toString().slice(0, -1);

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");

    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        try{

            // Create a new user instance so we can access the appropriate methods
            const userInstance = new User(request.User);

            // Delete the item from the cart
            userInstance.deleteFromCart(productId);

            // Update the user in our session
            // Also update our cart
            request.session.user = userInstance;
            request.session.cart = {
                items : userInstance.cart.items,
                totalPrice : userInstance.cart.totalPrice,
                userId : userInstance.cart?.userId
            }

            // Reload the cart page so we can query the updated cart
            response.redirect('back');

        }catch(err){

            console.clear();
            console.log("There's been a server error, please view below");
            console.log("\n");
    
            // Custom error object
            const error = new CustomError(err.message, 500);
    
            console.log(error);
    
            return next(error);
        }
 
    }else{

        response.status(403).send("CSRF protection failed!");
    }
};

// Create an order in the SQL backend
const postOrderCreate = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");

    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        try{

            // Create our order from the cart we pass through from the User singleton found in index.ts
            const orderInstance = new Order({
                totalPrice : request.User.cart.totalPrice,
                orderItems : request.User.cart.items,
                user : {
                    _id : request.User._id,
                    name : request.User.name
                }
            });

            // Store the order in the database
            await orderInstance.save();

            // We now need to empty our cart
            // We will create a User instance and we will delete the cart from the instance
            // Then we'll execute the save method to update the database user
            const userInstance = new User(request.User);

            // Empty the cart now that we've saved it as an order
            userInstance.emptyCart();

            // Update the user details in MongoDB
            await userInstance.save();

            // Update the user in the session and empty their cart too
            request.session.user = userInstance;
            
            // Move to the orders page
            response.redirect("/orders");

        }catch(err){

            console.clear();
            console.log("There's been a server error, please view below");
            console.log("\n");
    
            // Custom error object
            const error = new CustomError(err.message, 500);
    
            console.log(error);
    
            return next(error);
        }

    }else{

        response.status(403).send("CSRF protection failed!");
    }

};

export { getCart, postCart, postOrderCreate, getInvoiceController, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails };