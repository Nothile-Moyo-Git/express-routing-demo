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

    // Get the variables from our request body
    const title = String(request.body.title);
    const image = String(request.body.image);
    const description = String(request.body.description);
    const price = Number(request.body.price);
    const _id = new ObjectId(request.User._id);

    // Create new instance of product
    const productInstance = new Product(title, price, description, image, _id);

    await productInstance.save();

    response.redirect("http://localhost:3000/products");
};

// Get admin products controller
const getProducts = async (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Get the produts for the admin page
    const products = await Product.getAll();

    // Render the view of the page
    response.render("admin/products", { prods : products , pageTitle : "Admin Products" , hasProducts : products.length > 0 } );
};

// Update product controller
const updateProduct = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Get values from the request body
    const title = request.body.title;
    const image = request.body.image;
    const description = request.body.description;
    const price = Number(request.body.price);
    const _id = new ObjectId(request.User._id);

    // Instantiate products
    const productInstance = new Product(title, price, description, image, _id);

    // Update the product
    productInstance.updateById(request.params.id)

    // Render the view of the page
    response.redirect("/admin/products");
};

// Delete product controller
const deleteProduct = async (request : Request, response : Response, next : NextFunction) => {

    // Request parameters
    console.log("Request params");
    console.log(request.params);

    // Delete product
    await Product.deleteById(request.params.id);

    // Redirect to the admin products page since we executed admin functionality
    response.redirect("/admin/products");
};

export { getAddProduct, postAddProduct, getProducts, updateProduct, deleteProduct }; 