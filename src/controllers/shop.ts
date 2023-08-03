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
import { sequelize } from "../util/database";
import { QueryTypes } from "sequelize";
import Product from "../models/products";
import User from "../models/user";

// Extend the request object in order to set variables in my request object
interface UserInterface {
    id : number,
    name : string,
    email : string
}

interface RequestWithUserRole extends Request{
    User ?: UserInterface
}

// Sequelize Product Interface
interface SequelizeProductInterface {
    addOrder : any,
    id : number,
    title : string,
    image : string,
    description : string,
    price : number,
    productId : string,
    createdAt : Date,
    updatedAt : Date,
    userId : number,
    'cartItem.id' : number,
    'cartItem.quantity' : number,
    'cartItem.createdAt' : Date,
    'cartItem.productId' : Date,
    'cartItem.cartId' : number
}

// Order interface for our array, we will use an array of objects which contains an array of products and a total amount
interface OrderProductInterface{
    quantity : number,
    name : string,
    price : number
}

interface OrderArrayInterface{
    totalPrice : number,
    products : OrderProductInterface[],
    date : string
}

// Get the shop index page
const getIndex = ( request : RequestWithUserRole, response : Response, next : NextFunction ) => {

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
const getOrders = async ( request : RequestWithUserRole, response : Response, next : NextFunction ) => {

    // Get the user & the orders
    const user = request.User[0];
    const orders = await user.getOrders();
    const formattedOrders : OrderArrayInterface[] = [];
    const loopSize = orders.length;

    // Get the details for each order
    // We use a for loop so we can render on the final iteration
    for (let index = 0; index < loopSize; index++) {

        // Get the products for the order
        const products = [];

        // Set the total price for the order
        let totalPrice = 0;
        let createdDate = new Date();

        const orderProducts = await orders[index].getProducts({ raw : true });

        orderProducts.forEach((orderProduct : any) => {

            // Get the total price of the order
            totalPrice += orderProduct.price * orderProduct['orderItems.quantity'];

            // Get the date of the order 
            createdDate = orderProduct.updatedAt;

            // Create the new product
            const product : OrderProductInterface = {
                quantity : orderProduct['orderItems.quantity'],
                price : orderProduct.price * orderProduct['orderItems.quantity'],
                name : orderProduct.title
            };

            // Add the product to the products array
            products.push(product);
        });

        // Add to our orders
        formattedOrders.push({
            totalPrice : totalPrice,
            products : products,
            date : createdDate.toDateString()
        });
    };

    // Check if we have products
    const hasProducts = formattedOrders.length > 0;

    response.render("shop/orders", { pageTitle : "Orders", orders : formattedOrders, hasProducts : hasProducts });
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
const getCart = async (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    const user = new User("Nothile", "nothile1@gmail.com");
    console.log("User");
    console.log(user);

    // Render the admin products ejs template
    response.render("shop/cart", { 
        hasProducts : false, 
        products : [], 
        pageTitle : "Your Cart",
        totalPrice : 0
    });
};

// Add a new product to the cart using sequelize and a many to many relational mapper
const postCart = (request : any, response : Response, next : NextFunction) => {

    // Setting the product id from the request.body object
    const productId = request.body.productId;

    // Redirect to the cart page
    response.redirect("/cart");
}

// Delete an item from the cart using cart item
const postCartDelete = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    response.redirect('back');
};

// Create an order in the SQL backend
const postOrderCreate = async (request : RequestWithUserRole, response : Response, next : NextFunction) => {
    
    // Get the current user
    const user = request.User[0];
    const cart = await user.getCart();

    // Post order create async method
    const postOrderCreateAsync = async () => {

        // Get the products associated with that cart
        const products = await cart.getProducts({
            raw : true
        });

        // Create an order with the user id
        const newOrder = await user.createOrder();

        // Get the order id for reference
        const orderId = newOrder.dataValues.id;

        // Add each product to the order item
        products.forEach( async ( product : SequelizeProductInterface ) => {

            // Query to create a new order item
            const query = `INSERT INTO orderItems(id, quantity, orderId, productId) VALUES (${null}, ${product['cartItem.quantity']}, ${orderId}, ${product.id})`;

            // Execute the query and add the product to the database
            await sequelize.query(query, { type : QueryTypes.INSERT });
        });  
    };

    // Create the new order & order items and insert them into the database using a custom query
    // A custom query is used because the one to many association in sequelize doesn't work properly here
    postOrderCreateAsync();

    // Clear the cart by setting the products to null
    cart.setProducts(null);

    // Move to the orders page
    response.redirect("orders");
};

export { getCart, postCart, postOrderCreate, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails };