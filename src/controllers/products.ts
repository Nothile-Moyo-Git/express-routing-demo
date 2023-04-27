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
import Products from "../models/products";

// Product interface
interface Product {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string
}

// Instantiate our products 
const productsInstance = new Products();

// Get admin edit product controller
const getAdminEditProduct = (request : Request, response : Response, next : NextFunction) => {

    // Get all our products in an array
    const products = productsInstance.getProducts();

    // Filter the appropriate product based on the ID
    const editProduct = products.filter((product : Product) => {
        return product.id === request.params.id;
    });

    // Render the edit products template
    response.render(
        "admin/edit-product", 
        { 
            pageTitle : "Edit Products", 
            id : request.params.id, 
            productInformation : editProduct[0],
            hasProducts : editProduct.length !== 0
        });
};

export { getAdminEditProduct };