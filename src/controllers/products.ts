/**
 * Products controller
 * Handles requests and routing 
 * This controller uses the products model on order to handle functionality
 * 
 * @method getAdminEditProduct : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Product from '../models/products';
import { ObjectId } from 'mongodb';

// Get admin edit product controller
const getAdminEditProduct = async (request : Request, response : Response, next : NextFunction) => {

    // Remove the equals sign from the isAuthenticated cookie
    const cookie = request.get("Cookie").trim().split("=")[1];

    // Convert the string to a boolean
    const isAuthenticated = (cookie === "true");

    // Check if our Object id is valid in case we do onto a bad link
    // This is more of a pre-emptive fix for production builds
    const isObjectIdValid = ObjectId.isValid(request.params.id);

    // Create a new product Id and guard it
    const productId = isObjectIdValid ? new ObjectId(request.params.id) : null;

    // Get single product details
    const singleProduct = isObjectIdValid ? await Product.findById(productId) : null;

    // Check if we have products
    const hasProduct = singleProduct !== null;

    // Render the edit products template
    response.render(      
        "admin/edit-product", 
        { 
            pageTitle : "Edit Products", 
            id : productId, 
            productInformation : singleProduct,
            hasProducts : hasProduct,
            isAuthenticated : isAuthenticated
        }
    );
};

export { getAdminEditProduct };