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


// Get admin edit product controller
const getAdminEditProduct = async (request : Request, response : Response, next : NextFunction) => {


    // Render the edit products template
    response.render(      
        "admin/edit-product", 
        { 
            pageTitle : "Edit Products", 
            id : 0, 
            productInformation : {},
            hasProducts : false
        }
    );
};

export { getAdminEditProduct };