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
import Product from "../models/products";
import { ObjectId } from 'mongodb';
import User from "../models/user";

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string
}

interface RequestWithUser extends Request{
    User : UserInterface
}

// Set up interface to include the user role which we pass through
interface RequestWithUser extends Request{
    User : UserInterface,
    UserId : ObjectId
}

// Get the shop index page
const getIndex = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/index", { pageTitle : "Shop" });
};

// Get products controller
const getProducts = async (request : RequestWithUser, response : Response, next : NextFunction) => {

    // Find the product. If we need to find a collection, we can pass the conditionals through in an object
    const products = await Product.find({userId : new ObjectId(request.User._id)})
    .select("title price _id description image")
    .populate("userId", "name");

    // Render the products view
    response.render("shop/product-list", { prods : products, pageTitle: "My Products", path: "/", hasProducts : products.length > 0 });
};

// Get the orders
const getOrders = async ( request : RequestWithUser, response : Response, next : NextFunction ) => {

    // Render the view page
    response.render("shop/orders", { pageTitle : "Orders", orders : [], hasProducts : false });
};

// Get the checkout page from the cart
const getCheckout = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/checkout", { pageTitle : "Checkout" });
};

// Get product detail controller
const getProductDetails = async ( request : Request, response : Response, next : NextFunction ) => {

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
    response.render("shop/product-detail", { hasProduct : hasProduct, productDetails : singleProduct, pageTitle : "Product details" });
};

// Get the cart and all the products inside of it
const getCart = async (request : any, response : Response, next : NextFunction) => {

    // Instantiate the User that we have
    const userInstance = new User(request.User);

    // Check if we have products that we can render on the tempalate
    const hasProducts = userInstance.cart.items.length > 0;
 
    // Render the admin products ejs template
    response.render("shop/cart", { 
        hasProducts : hasProducts, 
        products : userInstance.cart.items, 
        pageTitle : "Your Cart",
        totalPrice : request.User.cart.totalPrice
    });
};

// Add a new product to the cart using a post request
// Acts as an add product handler
const postCart = async (request : RequestWithUser, response : Response, next : NextFunction) => {

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

    // Update the cart with the new item
    await userInstance.save();

    // Redirect to the cart page
    response.redirect("back");
}

// Delete an item from the cart using cart item
const postCartDelete = (request : RequestWithUser, response : Response, next : NextFunction) => {

    // Get product ID string
    const productId = request.body.productId.toString().slice(0, -1);

    response.redirect('back');
};

// Create an order in the SQL backend
const postOrderCreate = async (request : RequestWithUser, response : Response, next : NextFunction) => {

    
    // Move to the orders page
    response.redirect("orders");
};

export { getCart, postCart, postOrderCreate, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails };