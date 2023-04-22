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

// Instantiate our products 
const productsInstance = new Products();

// Get admin edit product controller
const getAdminEditProduct = (request : Request, response : Response, next : NextFunction) => {

    console.log("Outputting the params");
    console.log(request.params);


    // Render the edit products template
    response.render("admin/edit-product", { pageTitle : "Edit Products", id: request.params.id });
};

export { getAdminEditProduct };