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
import Product from '../models/products';

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
const getAdminEditProduct = async (request : Request, response : Response, next : NextFunction) => {

    // Get the product id
    const productId = request.params.id;

    // Get single product info
    const singleProduct = await Product.findById(productId);

    // Render the edit products template
    response.render(      
        "admin/edit-product", 
        { 
            pageTitle : "Edit Products", 
            id : productId, 
            productInformation : singleProduct,
            hasProducts : singleProduct ? true : false
        }
    );
};

export { getAdminEditProduct };