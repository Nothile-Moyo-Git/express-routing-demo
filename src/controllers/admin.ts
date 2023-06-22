// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Products from "../models/products";
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

// Instantiate our products 
const productsInstance = new Products();

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

        // Once we've added the product, save it to the messages.json file found in the data folder
        await productsInstance.saveProduct({ 
            title : request.body.title,
            image : request.body.image,
            description : request.body.description,
            price : request.body.price,
            userId : request.User.id,
            id : uuidv4()
        });

        // Redirect to the products page
        response.redirect("/products");
    };

    addProductAsync();

};

// Get admin products controller
const getProducts = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Render the admin products ejs template
    const renderAdminProducts = async () => {

        // Find all sequelize results
        const sequelizeProducts = await productsInstance.fetchAll( request.User[0].dataValues.id );;

        // Render the view of the page
        response.render("admin/products", { prods : sequelizeProducts , pageTitle : "Admin Products" , hasProducts : sequelizeProducts.length > 0 } );
    };

    // Execute the async function in order to render our view after finishing our sql query
    renderAdminProducts();
};

// Update product controller
const updateProduct = (request : RequestWithUserRole, response : Response, next : NextFunction) => {

    // Execute update functionality asyncronously
    const updateProductsAsync = async () => {

        // Get the results of the update product query
        const results = await productsInstance.updateProduct(
            request.body.title,
            request.body.image,
            request.body.description,
            request.body.price,
            request.params.id,
            request.User.id
        );
        
        // Render the view of the page
        response.render("admin/products", { prods : results , pageTitle : "Admin Products" , hasProducts : results.length > 0 } );
    
    };

    // Render the page with the new products
    updateProductsAsync();
};

// Delete product controller
const deleteProduct = (request : Request, response : Response, next : NextFunction) => {

    // Delete the product based on the ID in the JSON array
    productsInstance.deleteProduct(request.params.id);

    // Delete the product from the cart
    // Cart.deleteProduct( request.params.id );

    // Redirect to the admin products page since we executed admin functionality
    response.redirect("/admin/products");
};

export { getAddProduct, postAddProduct, getProducts, updateProduct, deleteProduct }; 