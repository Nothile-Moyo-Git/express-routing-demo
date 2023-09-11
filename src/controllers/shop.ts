/**
 * 
 * Shop controller.
 * This controller handles the routing for the cart and shop functionality.
 * It also hooks up the "shop" model which can be used to manage our data
 * This controller also handles the "order" model which is used during cart submissons
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
import Product from "../models/products";
import { ObjectId } from 'mongodb';
import User from "../models/user";
import Order from "../models/order";
import { SessionData, Session } from 'express-session';

// Cart items interface
interface CartItem {
    productId : ObjectId,
    title : string,
    quantity : number,
    price : number
}

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string
    cart : {
        totalPrice : number,
        items : CartItem[]
    }
}

// Extending session data as opposed to declaration merging
interface ExtendedSessionData extends SessionData {
    isLoggedIn : boolean,
    user : UserInterface
}

interface ExtendedRequest extends Request{
    User : UserInterface,
    body : {
        productId : ObjectId
    }
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionData>
}

// Get the shop index page
const getIndex = ( request : ExtendedRequest, response : Response, next : NextFunction ) => {

    // For now, redirect to the products page
    response.redirect("/products");
};

// Get products controller
const getProducts = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the user from the request session
    const user = request.session.user;
 
    // Find the product. If we need to find a collection, we can pass the conditionals through in an object
    const products = await Product.find({userId : new ObjectId( user === undefined ? null : user._id )})
    .select("title price _id description image")
    .populate("userId", "name");

    // Render the products view
    response.render("shop/product-list", { 
        prods : products, 
        pageTitle: "My Products", 
        path: "/", 
        hasProducts : products.length > 0,
        isAuthenticated : isLoggedIn === undefined ? false : true
    });
};

// Get the orders
const getOrders = async ( request : ExtendedRequest, response : Response, next : NextFunction ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the user from the request session
    const user = request.session.user;

    // Query the orders in the backend
    const orders = await Order.find({"user._id" : user === undefined ? null : user._id})
    .select("totalPrice orderItems createdAt user");

    // Render the view page
    response.render("shop/orders", { 
        pageTitle : "Orders", 
        orders : orders, 
        hasOrders : orders.length > 0,
        isAuthenticated : isLoggedIn === undefined ? false : true
    });
};

// Get the checkout page from the cart
const getCheckout = ( request : ExtendedRequest, response : Response, next : NextFunction ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    response.render("shop/checkout", { 
        pageTitle : "Checkout",
        isAuthenticated : isLoggedIn === undefined ? false : true
    });
};

// Get product detail controller
const getProductDetails = async ( request : ExtendedRequest, response : Response, next : NextFunction ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Check if our Object id is valid in case we do onto a bad link
    // This is more of a pre-emptive fix for production builds
    const isObjectIdValid = ObjectId.isValid(request.params.id);

    // Create a new product Id and guard it
    const productId = isObjectIdValid ? new ObjectId(request.params.id) : null;

    // Get single product details
    const singleProduct = isObjectIdValid ? await Product.findById(productId) : null;

    // Check if we have products
    const hasProduct = singleProduct !== null;

    // Render the admin products ejs template, make sure it's for the first object we get since Mongoose returns an array of BSON objects
    response.render("shop/product-detail", { 
        hasProduct : hasProduct, 
        productDetails : singleProduct,
        pageTitle : "Product details",
        isAuthenticated : isLoggedIn === undefined ? false : true
    });
};

// Get the cart and all the products inside of it
const getCart = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Instantiate the User that we have
    const user = request.session.user;

    // Check if we have products that we can render on the tempalate
    const hasProducts = user !== undefined ? user.cart.items.length > 0 : false;

    // Check if we have any users that work with the session
    const hasUser = user !== undefined;
 
    // Render the admin products ejs template
    response.render("shop/cart", { 
        hasProducts : hasProducts, 
        products : hasUser === true ? user.cart.items : [], 
        pageTitle : "Your Cart",
        totalPrice : request.User.cart.totalPrice,
        isAuthenticated : isLoggedIn === undefined ? false : true
    });
};

// Add a new product to the cart using a post request
// Acts as an add product handler
const postCart = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get product information based on the product Id
    const productId = request.body.productId;

    // Get product details
    const product = await Product.findOne({_id : productId})
    .select("title price _id");

    // Create a new instance of our user to gain access to mongoose static methods
    const userInstance = new User(request.User);

    // Set the product details into a new object
    const productDetails = {title : product.title, price : product.price, _id : product._id};

    // This is our new cart
    userInstance.addToCart(productDetails);

    // Update the user in the session
    request.session.user = userInstance;

    // Redirect to the cart page
    response.redirect("cart");
}

// Delete an item from the cart using cart item
const postCartDelete = (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get product ID string
    const productId = request.body.productId.toString().slice(0, -1);

    // Create a new user instance so we can access the appropriate methods
    const userInstance = new User(request.User);

    // Delete the item from the cart
    userInstance.deleteFromCart(productId);

    // Update the user in our session
    request.session.user = userInstance;

    // Reload the cart page so we can query the updated cart
    response.redirect('back');
};

// Create an order in the SQL backend
const postOrderCreate = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

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
    
    // Move to the orders page
    response.redirect("/orders");
};

export { getCart, postCart, postOrderCreate, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails };