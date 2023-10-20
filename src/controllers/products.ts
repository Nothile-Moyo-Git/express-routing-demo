/**
 * Products controller
 * Handles requests and routing 
 * This controller uses the products model on order to handle functionality
 * 
 * @method getAdminEditProduct : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Response } from 'express';
import Product from '../models/products';
import { ObjectId } from 'mongodb';
import { ExtendedRequestInterface } from '../@types';

// Get admin edit product controller
const getAdminEditProduct = async ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // csrfToken from our session
    const csrfToken = request.session.csrfToken;

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
        "pages/admin/edit-product", 
        { 
            pageTitle : "Edit Products", 
            id : productId, 
            productInformation : singleProduct,
            hasProducts : hasProduct,
            isAuthenticated : isLoggedIn === undefined ? false : true,
            csrfToken : csrfToken,
            isSubmitted : false,
            inputsValid : {
                isTitleValid : true,
                isImageValid : true,
                isDescriptionValid : true,
                isPriceValid : true
            }
        }
    );
};

export { getAdminEditProduct };