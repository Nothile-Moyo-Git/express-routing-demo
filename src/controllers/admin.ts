// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Product from '../models/products';
import { ObjectId } from 'mongodb';

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string
}

interface RequestWithUserRole extends Request{
    User : UserInterface
}

// Add product controller
const getAddProduct = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Send our HTML file to the browser
    response.render("admin/add-product", { pageTitle: "Add Product", path: "/admin/add-product" });
};

// Post add product controller
const postAddProduct = async(request : RequestWithUserRole, response : Response, next : NextFunction) => {

    response.redirect("http://localhost:3000/products");
};

// Get admin products controller
const getProducts = async (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Render the view of the page
    response.render("admin/products", { prods : [] , pageTitle : "Admin Products" , hasProducts : false } );
};

// Update product controller
const updateProduct = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Render the view of the page
    response.redirect("/admin/products");
};

// Delete product controller
const deleteProduct = async (request : Request, response : Response, next : NextFunction) => {

    // Redirect to the admin products page since we executed admin functionality
    response.redirect("/admin/products");
};

export { getAddProduct, postAddProduct, getProducts, updateProduct, deleteProduct }; 