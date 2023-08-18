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
import { ObjectId, WithId } from 'mongodb';
import User from "../models/user";
import { Document } from 'mongodb';

interface CartItem{
    productId : ObjectId,
    quantity : number,
    price : number
}
interface Cart {
    totalPrice : number,
    items : CartItem[]
}

interface UserInterface {
    name : string,
    email : string,
    cart : Cart,
    addToCart : (product : WithId<Document>, userId : ObjectId) => {},
    deleteFromCart : (id : string, userId : ObjectId) => {},
    addOrder : (userId : ObjectId) => {}
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
const getProducts = async (request : any, response : Response, next : NextFunction) => {

    // Get products
    const products = await Product.getAll();

    // Render the products view
    response.render("shop/product-list", { prods : products, pageTitle: "My Products", path: "/", hasProducts : products.length > 0 });
};

// Get the orders
const getOrders = async ( request : RequestWithUser, response : Response, next : NextFunction ) => {

    // Get the orders for the current user
    const orders = await User.getOrders(request.UserId);

    console.clear();
    console.log("Orders");
    console.log(orders);

    // Orders will either return an array of BSON(Binary JSON) objects or an empty array
    const hasProducts = orders.length > 0;

    // Render the view page
    response.render("shop/orders", { pageTitle : "Orders", orders : orders, hasProducts : hasProducts });
};

// Get the checkout page from the cart
const getCheckout = ( request : Request, response : Response, next : NextFunction ) => {

    response.render("shop/checkout", { pageTitle : "Checkout" });
};

// Get product detail controller
const getProductDetails = async ( request : Request, response : Response, next : NextFunction ) => {

    // Get product ID from the POST request
    const productId = request.params.id;

    // Get single product details
    const productDetails = await Product.findById(productId);

    // Check if the single values are empty
    const hasValue = productDetails ? true : false;

    // Render the admin products ejs template
    response.render("shop/product-detail", { hasProduct : hasValue, productDetails : productDetails, pageTitle : productDetails.title ? productDetails.title : "Product details" });
};

// Get the cart and all the products inside of it
const getCart = async (request : any, response : Response, next : NextFunction) => {

    const items = request.User.cart.items;

    let hasProducts = false;

    if (items !== undefined) {
        hasProducts = true;
    }
 
    // Render the admin products ejs template
    response.render("shop/cart", { 
        hasProducts : hasProducts, 
        products : hasProducts ? items : [], 
        pageTitle : "Your Cart",
        totalPrice : request.User.cart.totalPrice
    });
};

// Add a new product to the cart using a post request
// Acts as an add product handler
const postCart = async (request : RequestWithUser, response : Response, next : NextFunction) => {

    // Setting the product id from the request.body object
    const productId = request.body.productId;

    // Fetch our product by Id
    const product = await Product.findById(productId);

    // Execute the add to cart method
    request.User.addToCart(product, request.UserId);
    
    // Redirect to the cart page
    response.redirect("/cart");
}

// Delete an item from the cart using cart item
const postCartDelete = (request : RequestWithUser, response : Response, next : NextFunction) => {

    // Get product ID string
    const productId = request.body.productId.toString().slice(0, -1);

    // Get user Id
    const userId = request.UserId;

    request.User.deleteFromCart(productId, userId);

    response.redirect('back');
};

// Create an order in the SQL backend
const postOrderCreate = async (request : RequestWithUser, response : Response, next : NextFunction) => {

    // Call the addOrder method from the User model
    request.User.addOrder(request.UserId);
    
    // Move to the orders page
    response.redirect("orders");
};

export { getCart, postCart, postOrderCreate, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails };