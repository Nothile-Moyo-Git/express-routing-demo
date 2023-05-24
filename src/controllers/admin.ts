// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Products from "../models/products";
import Cart from '../models/cart';
import { v4 as uuidv4 } from "uuid";
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";

// Instantiate our products 
const productsInstance = new Products();

// Add product controller
const getAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    response.render("admin/add-product", { pageTitle: "Add Product", path: "/admin/add-product" });
};

// Post add product controller
const postAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Add a new product to the array
    productsInstance.addProduct({ 
        title : request.body.title,
        image : request.body.image,
        description : request.body.description,
        price : request.body.price,
        id: uuidv4() 
    }); 

    // Once we've added the product, save it to the messages.json file found in the data folder
    productsInstance.saveProduct({ 
        title : request.body.title,
        image : request.body.image,
        description : request.body.description,
        price : request.body.price,
        id: uuidv4() 
    }); 

    // Redirect to the products page
    response.redirect("/products");
};

// Get admin products controller
const getProducts = (request : Request, response : Response, next : NextFunction) => {

    // Get the static response from the cart
    // Execute our promise here in our sync code so we don't need to make eveyrhting else async
    // This will move over to be async later

    /*
        productsInstance.fetchAll().then(([rows] : any) => {

            // Render the view of the page
            response.render("admin/products", { prods : rows , pageTitle : "Admin Products" , hasProducts : rows.length > 0 } );

        }).catch((error) => {

            console.log(error);

        }); 
    */

    // Render the admin products ejs template
    const renderAdminProducts = async () => {

        // Get the result of the SQL query
        const result : [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]] = await productsInstance.fetchAll();
        
        // Convert our result from a RowDataPacket to an array
        const resultsArray = JSON.parse( JSON.stringify(result[0] ));

        // Render the view of the page
        response.render("admin/products", { prods : resultsArray , pageTitle : "Admin Products" , hasProducts : resultsArray.length > 0 } );
    };

    renderAdminProducts();
};

// Update product controller
const updateProduct = (request : Request, response : Response, next : NextFunction) => {

    productsInstance.updateProduct(
        request.body.title,
        request.body.image,
        request.body.description,
        request.body.price,
        request.params.id
    );

    response.redirect("/admin/products");
};

// Delete product controller
const deleteProduct = (request : Request, response : Response, next : NextFunction) => {

    // Delete the product based on the ID in the JSON array
    productsInstance.deleteProduct(request.params.id);

    // 
    Cart.deleteProduct( request.params.id );

    // Redirect to the admin products page since we executed admin functionality
    response.redirect("/admin/products");
};

export { getAddProduct, postAddProduct, getProducts, updateProduct, deleteProduct }; 