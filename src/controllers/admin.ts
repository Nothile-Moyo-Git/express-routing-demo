// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from "uuid";

// Extend the request object in order to set variables in my request object
interface UserInterface {
    id : number,
    name : string,
    email : string
}

interface RequestWithUserRole extends Request{
    User ?: UserInterface | any
}

// Add product controller
const getAddProduct = (request : Request, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    response.render("admin/add-product", { pageTitle: "Add Product", path: "/admin/add-product" });
};

// Post add product controller
const postAddProduct = async(request : RequestWithUserRole, response : Response, next : NextFunction) => {

    console.clear();

    // Add product 
    const addProductAsync = async () => {

        // Redirect to the products page
        response.redirect("/products");
    };

    addProductAsync();

};

// Get admin products controller
const getProducts = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Render the admin products ejs template
    const renderAdminProducts = async () => {



        // Render the view of the page
        response.render("admin/products", { prods : [] , pageTitle : "Admin Products" , hasProducts : false } );
    };

    // Execute the async function in order to render our view after finishing our sql query
    renderAdminProducts();
};

// Update product controller
const updateProduct = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Execute update functionality asyncronously
    const updateProductsAsync = async () => {
        
        // Render the view of the page
        response.render("admin/products", { prods : [] , pageTitle : "Admin Products" , hasProducts : false } );
    };

    // Render the page with the new products
    updateProductsAsync();
};

// Delete product controller
const deleteProduct = (request : Request, response : Response, next : NextFunction) => {

    // Redirect to the admin products page since we executed admin functionality
    response.redirect("/admin/products");
};

export { getAddProduct, postAddProduct, getProducts, updateProduct, deleteProduct }; 