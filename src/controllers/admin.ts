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
const postAddProduct = async(request : Request, response : Response, next : NextFunction) => {

    // Fields
    const title = request.body.title;
    const image = request.body.image;
    const price = Number(request.body.price);
    const description = request.body.description;

    // Instantiate our product
    const product = new Product({
        title : title,
        image : image,
        description : description,
        price : price,    
    });

    // Save our new product to the database
    // Note : This method is inherited from the Mongoose model
    product.save();

    response.redirect("/products");
};

// Get admin products controller
const getProducts = async (request : Request, response : Response, next : NextFunction) => {

    // Find the product. If we need to find a collection, we can pass the conditionals through in an object
    const products = await Product.find();

    // Render the view of the page
    response.render("admin/products", { prods : products , pageTitle : "Admin Products" , hasProducts : products.length > 0 } );
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