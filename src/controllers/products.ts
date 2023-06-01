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

// Sql product interface
interface SQLProduct {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string,
    productid : string
};

// Instantiate our products 
const productsInstance = new Products();

// Get admin edit product controller
const getAdminEditProduct = (request : Request, response : Response, next : NextFunction) => {
    
    // Get async admin edit product
    const getAdminEditProductAsync = async () => {

        // Products
        const result = await productsInstance.fetchAll();

        // Convert our result from a RowDataPacket to an array
        const resultsArray = JSON.parse( JSON.stringify(result[0] ));

        // Filter the appropriate product based on the ID
        const editProductItem = resultsArray.filter((product : SQLProduct) => {
            return product.productid === request.params.id;
        });

        // Render the edit products template
        response.render(      
            "admin/edit-product", 
            { 
                pageTitle : "Edit Products", 
                id : request.params.id, 
                productInformation : editProductItem[0],
                hasProducts : editProductItem.length !== 0
            }
        );
    };

    getAdminEditProductAsync();

};

export { getAdminEditProduct };