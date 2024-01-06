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
 * @method getIndex : (request : Request, response : Response) => void
 * @method getProducts : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getInvoiceController : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getOrders : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getCheckout : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getShop : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getProductDetails : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method postHandlePayment : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getCheckoutSuccess : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getCreateWebhookEndpoint : : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method getCart : async ( request : ExtendedRequestInterface, response : Response ) => void
 * @method postCart : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method postOrderCreate : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 * @method postCartDelete : async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => void | next
 */

// import our express types for TypeScript use
import { NextFunction, Response, Request } from 'express';
import { createReadableDate, getPaginationValues } from '../util/utility-methods';
import Product from "../models/products";
import { stripeSecretKey } from '../data/connection';
import Stripe from "stripe";
import { ObjectId } from 'mongodb';
import User from "../models/user";
import Order from "../models/order";
import { CartItemInterface, ExtendedRequestInterface, OrderItemInterface } from '../@types';
import CustomError from '../models/error';
import path from 'path';
import PDFDocument from "pdfkit";
import fs from 'fs';

// Get the shop index page
const getIndex = ( request : Request, response : Response ) => {

    // For now, redirect to the products page
    response.redirect("/products");
};

// Get products controller
const getProducts = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Count the total number of products we have for pagination
    const count = await Product.count({ userId : request.session.user._id });

    // Check if the user is logged in so we determine which menu we want to show, if we don't do this we always show the logged in menu even if we're not
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken : string = request.session.csrfToken;

    try{

        const { page, limit = 5 } = request.query;

        const currentPage = page ? Number(page) : 1;

        const numberOfPages = Math.ceil(count / Number(limit));

        const paginationValues = getPaginationValues(currentPage, numberOfPages);

        // Find the product. If we need to find a collection, we can pass the conditionals through in an object
        const products = await Product.find()
        // Convert limit to a number, we're using 5 per page
        .limit(Number(limit) * 1)
        // Pick the page we want, we start at 0 because programming
        .skip((Number(page) - 1) * Number(limit))
        // Select the fields we want
        .select("title price _id description image")
        // Get the user ID and name from the users collection
        .populate("userId", "name");

        // Render the products view
        response.render("pages/shop/product-list", { 
            prods : products, 
            pageTitle: "My Products", 
            path: "/", 
            hasProducts : products.length > 0,
            isAuthenticated : isLoggedIn === undefined ? false : true,
            csrfToken : csrfToken,
            pages : Math.ceil(count / Number(limit)),
            currentPage : currentPage,
            numberOfPreviousPages : paginationValues.numberOfPreviousPages,
            numberOfUpcomingPages : paginationValues.numberOfUpcomingPages,
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

    const isAuthenticated = request.session.isLoggedIn === undefined ? false : true;

    // Generate appropriate pathname
    const fileName = "invoice-" + orderId + ".pdf";
    const filePath = path.join(__dirname, `../data/invoices/invoice-${orderId}.pdf`);

    try{

        // Get the order data so we can find the user and make a comparison
        const order = await Order.findOne({_id : orderId});

        if (order) {

            // Create our date and convert the format
            const dateCreated = createReadableDate(order.createdAt);

            let fileExists = false;

            // Check if the file with the name already exists
            fs.access(filePath, fs.constants.F_OK, (err : Error) => {

                fileExists = err ? false : true; 
                console.log(`${filePath} ${err ? 'does not exist' : 'exists :)'}`);
            });

            if (fileExists === false) {

                // Create an empty PDF
                const pdfDocument = new PDFDocument();

                // Pipe the output (combine multiple functions to make writing the code easier) to a file in our invoices folder
                pdfDocument.pipe( fs.createWriteStream(filePath) );

                // Return a response
                pdfDocument.pipe(response);

                // Add the page with our order details
                pdfDocument.fontSize(16);

                // Save our file to the server
                pdfDocument
                    .text(`Invoice for order #${order._id.toString()}`, { align : "center" })
                    .moveDown()
                    .text(`Purchased: ${dateCreated}`,{ align : "center" })
                    .moveDown()
                    .text(`Total : £${order.totalPrice}`)
                    .moveDown()
                    .text(`Items purchased:`)

                // Add each order item to the invoice
                order.orderItems.forEach((orderItem : OrderItemInterface) => {

                    // Add the item to the page
                    pdfDocument
                        .text(`${orderItem.title} x ${orderItem.quantity}`)
                        .moveUp(1)
                        .text(`£${orderItem.price}`,{
                            lineBreak : true,
                            align : "right",
                        });
                });

                // Finalise the PDF file, this prevents memory leaks
                pdfDocument.moveDown().end();
            }

            const orderUser = order.user;
            const sessionUser = request.session.user;
        
            // Is the user valid?
            const isUserValid = orderUser._id.toString() === sessionUser._id.toString();
    
            if (isUserValid === true) {

                // Create data stream for the PDF, we do this to stagger the file load instead of loading it all at once
                // This reduces delays with the server
                const stream = fs.createReadStream(filePath, { start : 0 });
                
                // Send the PDF to the browser
                response.setHeader("Content-Type", "application/pdf");
    
                // Content-Disposition allows us to decide how we want to render it in the browser
                // Note: If you change "inline" to "attachment" then instead of opening in a new browser, the file is downloaded
                response.setHeader("Content-Disposition", `inline; filename=${fileName}`);
    
                // Since response is a writable stream (it's a record), it can be used with readStream since it's a stream to be read
                stream.pipe(response);
            }
        }else{

            // Custom error object
            response.status(400).render("errors/400",{
                pageTitle : "400",
                isAuthenticated : isAuthenticated,
                csrfToken : request.session.csrfToken,
                errorMessage : "Error: Order not found",
                previousLink : "/orders"
            });
        }
    
    }catch(err){

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

    // Count the number of orders based on users
    const count = await Order.count({ "user._id" : request.session.user._id });

    try{

        // Pagination
        const { page, limit = 2 } = request.query;

        // Sort out the current page and number of pages
        const currentPage = page ? Number(page) : 1;
        const numberOfPages = Math.ceil(count / Number(limit));

        const paginationValues = getPaginationValues(currentPage, numberOfPages);

        // Query the orders in the backend
        const orders = await Order.find({"user._id" : user === undefined ? null : user._id})
        .limit(Number(limit) * 1)
        // Pick the page we want, we start at 0 because programming
        .skip((Number(page) - 1) * Number(limit))
        .select("_id totalPrice orderItems createdAt user");

        // Render the view page
        response.render("pages/shop/orders", { 
            pageTitle : "Orders", 
            orders : orders, 
            hasOrders : orders.length > 0,
            isAuthenticated : isLoggedIn === undefined ? false : true,
            csrfToken : csrfToken,
            pages : numberOfPages,
            currentPage : currentPage,
            numberOfPreviousPages : paginationValues.numberOfPreviousPages,
            numberOfUpcomingPages : paginationValues.numberOfUpcomingPages
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
const getCheckout = async ( request : ExtendedRequestInterface, response : Response ) => {

    // Instantiate the User that we have
    const user = request.session.user;

    // Get our CSRF token if we don't have one already
    const csrfToken = request.session.csrfToken;

    // Get the cart from the session, we store it in the session with the userId so that they can be used anywhere
    const cart = request.session.cart;

    // Check if we have products that we can render on the tempalate
    const hasProducts = cart.items.length > 0 ? true : false;

    // Check if we have any users that work with the session
    const hasUser = user !== undefined;

    // Instantiate stripe
    const stripe = new Stripe(stripeSecretKey);

    // Get the products
    const products = cart.items;

    if (products.length > 0) {

        // Creating the stripe session for checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types : ['card'],
            mode : 'payment',
            line_items : products.map((product : CartItemInterface) => {
                return {
                    price_data : {
                        currency : 'gbp',
                        unit_amount : product.price * 100,
                        product_data : {
                            name : product.title,

                        }
                    },
                    quantity : product.quantity
                };
            }),
            success_url : request.protocol + "://" + request.get('host') + `/checkout/success?{CHECKOUT_SESSION_ID}`,
            cancel_url : request.protocol + "://" + request.get('host') + `/checkout/cancel`
        });

        // Set session id
        const sessionId = session.id;

        response.render("pages/shop/checkout/checkout", { 
            pageTitle : "Checkout",
            isAuthenticated : true,
            csrfToken : csrfToken,
            sessionId : sessionId,
            cart : cart,
            hasProducts : hasProducts, 
            products : hasUser === true ? products : [],
            clickHandler : "handlePayment()"
        });
    }else{

        response.redirect("/products");
    }

};

// Create a webhook endpoint for stripe.
// NOTE: THIS IS FOR LOCAL TESTING, go to https://stripe.com/docs/webhooks in order to find out how to create live endpoints
const getCreateWebhookEndpoint = async (request : any, response : Response, next : NextFunction) => {

    // Instantiate Stripe
    const stripe = new Stripe(stripeSecretKey);

    // Create a webhook endpoint
    const webhookEndpoint = await stripe.webhookEndpoints.create({
        enabled_events : ["checkout.session.completed", "checkout.session.expired"],
        url : "http://localhost:3000/webhook"
    });

    // Output content
    console.clear();
    console.log("Stripe");
};

// Handle the checkout.session.completed event by stripe so that we don't automatically delete our orders
const postHandleStripeEvents = async ( request : any, response : Response, next : NextFunction) => {

    // Get the event from stripe, we do this here because this webhook is only called by the post request
    const event = request.body;

    // Handle the event
    switch (event.type) {

        case 'payment_intent.created':
            // const paymentIntentCreated = event.data.object;
            // Then define and call a method to handle the successful payment intent.
            // handlePaymentIntentSucceeded(paymentIntent);

            /* 

            try{

                // Create our order from the cart we pass through from the User singleton found in index.ts
                const orderInstance = new Order({
                    totalPrice : cart.totalPrice,
                    orderItems : cart.items,
                    user : {
                        _id : user._id,
                        name : user.name
                    }
                });

                // Store the order in the database
                await orderInstance.save();

                // We now need to empty our cart
                // We will create a User instance and we will delete the cart from the instance
                // Then we'll execute the save method to update the database user
                const userInstance = new User({
                    _id : user._id,
                    name : user.name,
                    email : user.email,
                    password : user.password,
                    cart : cart,
                    resetToken : user.resetToken,
                    resetTokenExpiration : user.resetTokenExpiration
                });

                // Empty the cart now that we've saved it as an order
                userInstance.emptyCart();

                // Update the user details in MongoDB
                await User.updateOne({ _id : user._id}, {
                    cart : {
                        items : [],
                        totalPrice : 0
                    }
                });

                // Update the user in the session and empty their cart too
                request.session.user = userInstance;

                // Update the cart in the session since it's the cart that gets referenced when we visit the cart
                // Update the cart which we store separately in our session
                request.session.cart = {
                    items : userInstance.cart.items,
                    totalPrice : userInstance.cart.totalPrice,
                    userId : cart.userId
                };

                console.log("\n", "Payment intent created event run");

            }catch(err){

                console.clear();
                console.log("There's been a server error, please view below");
                console.log("\n");
        
                // Custom error object
                const error = new CustomError(err.message, 500);
        
                console.log(error);
        
                return next(error);
            } */

        break;

        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            
            // Then define and call a method to handle the successful payment intent.
            // handlePaymentIntentSucceeded(paymentIntent);
            console.log("\n", "Pay intent succeeded event run");
        break;

        case 'payment_method.attached':
            const paymentMethodAttached = event.data.object;
            // Then define and call a method to handle the successful attachment of a PaymentMethod.
            // handlePaymentMethodAttached(paymentMethod);
            console.log("\n", "Payment method attached event run");
        break;

        case 'charge.succeeded':
            const chargeSucceeded = event.data.object;
            console.log("\n", "Charge succeeded event run");
        break;

        case 'checkout.session.completed':
            const checkoutSessionCompleted = event.data.object;
            console.log("\n", "Checkout session completed event run");
        break;

        case 'checkout.session.expired':
            const checkoutExpired = event.data.object
            console.log("\n", "Checkout expired event run");
        break;
    
        // ... handle other event types
        default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a response to acknowledge receipt of the event
    response.json({received: true});

    response.status(200).end();
};

// Render the checkout success page
const getCheckoutSuccess = async ( request : any, response : Response, next : NextFunction ) => {
    
    console.log("Request body");
    console.log(request.query);

    console.log("\n", "Response", "\n", request.json);

    // Move to the orders page
    response.redirect("/orders");
};

// Get product detail controller
const getProductDetails = async ( request : ExtendedRequestInterface, response : Response, next : NextFunction ) => {

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

    // Get the cart from the session, we store it in the session with the userId so that we can reference their cart
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
        .select("title price _id image description");

        if (user !== undefined && isCSRFValid === true) {

            // Create a new instance of our user to gain access to mongoose static methods
            const userInstance = new User(user);
        
            // Set the product details into a new object
            const productDetails = { title : product.title, price : product.price, _id : product._id, image : product.image, description : product.description };

            // This is our new cart
            userInstance.addToCart(productDetails);

            // Update the document in Mongoose as the save method when we instantiate it isn't flexible enough
            await User.updateOne({_id : new ObjectId(user._id)},{cart : userInstance.cart});

            // Update the user in the session so we don't have to restart the server after adding an item to our cart
            request.session.user = userInstance;

            // Update the cart which we store separately in our session
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

    // Get the cart from the session, we store it in the session with the userId so that we can reference their cart
    const cart = request.session.cart;

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
            // await userInstance.save();
            await User.updateOne({ _id : request.User._id },{
                cart : {
                    items : [],
                    totalPrice : 0
                }
            });

            // Update the user in the session and empty their cart too
            request.session.user = userInstance;

            // Update the cart in the session since it's the cart that gets referenced when we visit the cart
            // Update the cart which we store separately in our session
            request.session.cart = {
                items : userInstance.cart.items,
                totalPrice : userInstance.cart.totalPrice,
                userId : cart.userId
            };
            
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

export { getCart, postCart, postOrderCreate, getInvoiceController, postCartDelete, getProducts, getCheckout, postHandleStripeEvents, getCheckoutSuccess, getIndex, getOrders, getProductDetails };