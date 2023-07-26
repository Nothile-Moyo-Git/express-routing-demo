/**
 * Products controller
 * Handles requests and routing 
 * This controller uses the products model on order to handle functionality
 * 
 * @method getAddProduct : (request : Request, response : Response, next : NextFunction) => void
 * @method postAddProduct : (request : Request, response : Response, next : NextFunction) => void
 * @method getProducts : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Sql product interface
interface SQLProduct {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string,
    productid : string
};


// Get admin edit product controller
const getAdminEditProduct = (request : Request, response : Response, next : NextFunction) => {
    
    // Get async admin edit product
    const getAdminEditProductAsync = async () => {

        // Render the edit products template
        response.render(      
            "admin/edit-product", 
            { 
                pageTitle : "Edit Products", 
                id : request.params.id, 
                productInformation : [],
                hasProducts : false
            }
        );
    };

    getAdminEditProductAsync();

};

export { getAdminEditProduct };