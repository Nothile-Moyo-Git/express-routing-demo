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

// Import the cart sequelize
import SequelizeCart from "../models/cart";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Products from "../models/products";


// Extend the request object in order to set variables in my request object
interface UserInterface {
    id : number,
    name : string,
    email : string
}

interface RequestWithUserRole extends Request{
    User ?: UserInterface
}

// Instantiate our products 
const productsInstance = new Products();

// Get the shop index page
const getIndex = ( request : RequestWithUserRole, response : Response, next : NextFunction ) => {

    response.render("shop/index", { pageTitle : "Shop" });
};

// Get products controller
const getProducts = (request : any, response : Response, next : NextFunction) => {

    // Render the products page async
    const getProductsAsync = async() => {

        // Get the result of the SQL query
        const result = await productsInstance.fetchAll( request.User[0].dataValues.id );

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

// Get the cart and all the products inside of it
const getCart = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Get the current cart based on the user
    const getCartAsync = async () => {

        // Get the cart results
        const cart = await request.User[0].getCart();       
        const products = await request.User[0].getProducts();
        
        console.clear();
        console.log( "Get cart" );
        console.log( cart );
        console.log( "\n\n" );
        console.log( "Get products" );
        console.log( products );

        // Add a product if our cart is empty for testing
        if (products.length === 0) {
            
            /*
            cart.addProduct({
                id : 1,
                quantity : 1,
                cartId : 1,
                productId : 1
            }); */
        }

        // Render the admin products ejs template
        response.render("shop/cart", { 
            hasProducts : false, 
            products : products, 
            pageTitle : "Your Cart",
            totalPrice : 0
         });
    };

    // Execute get cart functionality
    getCartAsync();
};


export { getCart, getProducts, getCheckout, getIndex, getOrders, getProductDetails };