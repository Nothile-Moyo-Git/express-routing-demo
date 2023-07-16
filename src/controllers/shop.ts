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
import { SequelizeProducts } from "../models/products";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Products from "../models/products";
import { sequelize } from "../util/database";
import { QueryTypes } from "sequelize";

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
    products : OrderProductInterface[]
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
const getOrders = async ( request : RequestWithUserRole, response : Response, next : NextFunction ) => {

    // Get the user & the orders
    const user = request.User[0];
    const orders = await user.getOrders();
    const formattedOrders : OrderArrayInterface[] = [];
    const loopSize = orders.length;

    console.clear();
    console.log("console cleared");

    // Get the details for each order
    // We use a for loop so we can render on the final iteration
    for (let index = 0; index < loopSize; index++) {

        // Get the products for the order
        const products = [];

        // Set the total price for the order
        let totalPrice = 0;

        const orderProducts = await orders[index].getProducts({ raw : true });

        orderProducts.forEach((orderProduct : any) => {

            totalPrice += orderProduct.price * orderProduct['orderItems.quantity'];

            const product : OrderProductInterface = {
                quantity : orderProduct['orderItems.quantity'],
                price : orderProduct.price * orderProduct['orderItems.quantity'],
                name : orderProduct.title
            };

            products.push(product);

        });

        formattedOrders.push({
            totalPrice : totalPrice,
            products : products
        });
    };

    console.log("\n\n\n");
    console.log("formatted orders 2");
    console.log(formattedOrders);

    console.log("\n\n\n");
    console.log("array size");
    console.log(loopSize);


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
        const cartProducts = await cart.getProducts();

        // Create a variable so we can calculate the total price
        let totalPrice = 0;

        // Loop through each cart item so we can get the price and quatity for total price
        cartProducts.forEach((singleProduct: { price: number; cartItem: { dataValues: { quantity: number; }; }; }) => {

            // Get price and quantity from single cart item
            // Each cart item comes with a "cartItem" object as it's used as the "through" value in the many to many relationship
            const singlePrice : number = singleProduct.price;
            const quantity : number = singleProduct.cartItem.dataValues.quantity;  

            // Add to the base total price
            totalPrice += (singlePrice * quantity);
        });

        // Render the admin products ejs template
        response.render("shop/cart", { 
            hasProducts : cartProducts.length > 0, 
            products : cartProducts, 
            pageTitle : "Your Cart",
            totalPrice : totalPrice
         });
    };

    // Execute get cart functionality
    getCartAsync();
};

// Add a new product to the cart using sequelize and a many to many relational mapper
const postCart = (request : any, response : Response, next : NextFunction) => {

    // Setting the product id from the request.body object
    const productId = request.body.productId;

    // Add a product to my cart
    const postCartAsync = async () => {

        // Get the cart
        const cart = await request.User[0].getCart();

        // Get the products associated with that cart
        const products = await cart.getProducts({ where : { id : productId }});

        // If we have a product, add quantity to it
        let product;
        let newQuantity = 1;
        let result;

        // Set the product if it already exists
        if (products.length > 0) {
            product = products[0];
        }

        // Add to the quantity or create a new quantity
        if (product) {

            // When getting a product through the cart, they're linked through a cartitem and an associative query pulls the "through" item through as well
            const cartItem = products[0].dataValues.cartItem;

            // Add another item to the quantity
            newQuantity = cartItem.dataValues.quantity + 1;

            // Add the product by updating the quantity
            result = await cart.addProduct(product, {
                through : {
                    quantity : newQuantity
                },
                where : {
                    productId : productId
                }
            });

        }else{

            // Get product based on the product id
            const currentProduct = await SequelizeProducts.findAll({ where : { id : productId } });

            // If we get a project, add it to the cart through the quantity which allows the field to be set
            if ( currentProduct ) {

                result = await cart.addProduct(currentProduct[0], { 
                    through : {
                        quantity : newQuantity
                    }
                });
            }
        }


        // Redirect to the cart page
        response.redirect("/cart");
    };

    postCartAsync();
}

// Delete an item from the cart using cart item
const postCartDelete = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    const postCartDeleteAsync = async () => {

        // Get the product id, slice is used to remove the trailing / at the end
        const productId = request.body.productId.slice(0, -1);

        // Get the cart
        const cart = await request.User[0].getCart();

        // Delete the item from the cart using cartItem
        const products = await cart.getProducts({
            where : {
                id : productId
            }
        });

        // Destroy the product from using cart item since there's a many to many association
        await products[0].cartItem.destroy();
    }

    postCartDeleteAsync();

    response.redirect('back');
};

// Create an order in the SQL backend
const postOrderCreate = async (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Get the totalPrice from request body and remove the trailing slash
    // const totalPrice = request.body.totalPrice.replace("/","");
    
    // Get the current user
    const user = request.User[0];

    // Post order create async method
    const postOrderCreateAsync = async () => {

        // Get the cart
        const cart = await user.getCart();

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

    // Empty the contents of our cart
    const clearCartAfterCreatingOrder = async () => {

        // Get the cart
        const cart = await request.User[0].getCart();

        // Get the current products from the current cart item
        const products = await cart.getProducts();

        // Loop through each cart item and remove it form the cart
        products.forEach( async ( product : any ) => {

            // Get current cart item
            const cartItem = product.cartItem;

            // Delete the cart item
            cartItem.destroy();
        });
    };

    // Create the new order & order items and insert them into the database using a custom query
    // A custom query is used because the one to many association in sequelize doesn't work properly here
    postOrderCreateAsync();

    // Call clear cart method
    clearCartAfterCreatingOrder();

    // Get the orders for the current user and render them on the orders page 
    const products = await user.getProducts();
    const orders = await user.getOrders();

    console.clear();
    console.log("console cleared");

    orders.forEach((order : any) => {

        const orderProducts = order.getProducts();

        console.log("\n\n\n");
        console.log("products");
        console.log(orderProducts);
    });

    // Go back to the cart page for now
    response.render("shop/orders", { pageTitle : "Orders Page" });
};

export { getCart, postCart, postOrderCreate, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails };