/**
 * Author : Nothile Moyo
 * Date Written : 25/04 /2023
 * License : MIT
 *
 * Admin Controller, handles the requests to do with administration ( adding products etc... )
 * This file allows the user to do more than just 
 *
 * @method getAddProduct = ( request : ExtendedRequestInterface, response : Response ) => void
 * @method postAddProduct = ( request : ExtendedRequestInterface, response : Response ) => void | response : Response
 * @method getProducts = ( request : ExtendedRequestInterface, response : Response ) => void
 * @method updateProductController = ( request : ExtendedRequestInterface, response : Response ) => void | response : Response
 * @method deleteProduct = ( request : ExtendedRequestInterface, response : Response ) => void | response : Response
 * @method getAdminEditProduct = ( request : ExtendedRequestInterface, response : Response ) => void
 */

// import our express types for TypeScript use
import { NextFunction, Response } from 'express';
import Product from '../models/products';
import { ObjectId } from 'mongodb';
import { ExtendedRequestInterface } from '../@types';
import { isFloat, isInt } from "../util/utility-methods";
import CustomError from '../models/error';
import { getFolderPathFromDate, getPaginationValues } from '../util/utility-methods';
import path from 'path';
import { deleteFile } from "../util/file";

// Add product controller
const getAddProduct = ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Send our HTML file to the browser
    response.render("pages/admin/add-product", { 
        pageTitle: "Add Product", 
        isAuthenticated : isLoggedIn === undefined ? false : true,
        csrfToken : csrfToken,
        oldInput : {},
        inputsValid : {
            titleValid : true,
            imageUrlValid : true,
            priceValid : true,
            descriptionValid : true,
            imageValid : true
        }
    });
};

// Post add product controller
const postAddProduct = async( request : ExtendedRequestInterface, response : Response, next : NextFunction ) => {

    // Fields
    const title = request.body.title;
    const price = Number(request.body.price);
    const description = request.body.description;
    const image = request.file;

    // Set the folder path
    const folderPath = `/uploads/${ getFolderPathFromDate() }`;
    const destination = folderPath + request.fileName;

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Instantiate the User that we have
    const user = request.session.user;

    // Validate our inputs
    const isTitleValid = title.length >= 3;
    const isDescriptionValid = description.length >= 5 && description.length <= 400;
    const isPriceValid = isFloat(price) || isInt(price);
    const isImageValid = image ? true : false;

    if (isCSRFValid === true) {

        if (isTitleValid === true && isDescriptionValid === true && isPriceValid === true) {
            
            try{

                // Check if we have a user
                const hasUser = user !== undefined;

                // Instantiate our product
                const product = new Product({
                    title : title,
                    description : description,
                    image : destination,
                    price : price,
                    userId : hasUser === true ? request.session.user._id : new ObjectId(null) 
                });

                // Save our new product to the database
                // Note : This method is inherited from the Mongoose model
                // Only save the product if we're logged in
                if (hasUser === true) {
                    await product.save();
                }

                response.redirect("/products");

            }catch(err){
     
                console.clear();
                console.log("There's been a server error, please view below");
                console.log("\n");

                // Custom error object
                const error = new CustomError(err.message, 500);

                console.log(error);

                return next(error);
            }

        }else{

            // Send our HTML file to the browser
            response.render("pages/admin/add-product", { 
                pageTitle: "Add Product", 
                isAuthenticated : isLoggedIn === undefined ? false : true,
                csrfToken : sessionCSRFToken,
                oldInput : {
                    oldTitle : title,
                    oldPrice : price,
                    oldDescription : description
                },
                inputsValid : {
                    titleValid : isTitleValid,
                    priceValid : isPriceValid,
                    descriptionValid : isDescriptionValid,
                    imageValid : isImageValid
                }
            });  
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Get admin products controller
const getProducts = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Instantiate the User that we have
    const user = request.session.user;

    // Check if we have any users that work with the session
    const hasUser = user !== undefined;

    console.clear();

    // Count the total number of products we have for pagination
    const count = await Product.count({ userId : request.session.user._id });

    try{

        const { page, limit = 5 } = request.query;

        const currentPage = page ? Number(page) : 1;

        const numberOfPages = Math.ceil(count / Number(limit));

        const paginationValues = getPaginationValues(currentPage, numberOfPages);

        // Find the product. If we need to find a collection, we can pass the conditionals through in an object
        const products = await Product.find({userId : new ObjectId(hasUser === true ? user._id : null)})
        // Convert limit to a number, we're using 5 per page
        .limit(Number(limit) * 1)
        // Pick the page we want, we start at 0 because programming
        .skip((Number(page) - 1) * Number(limit))
        .select("title price _id description image")
        .populate("userId", "name");

        // Render the view of the page
        response.render("pages/admin/products", { 
            prods : products, 
            pageTitle : "Admin Products", 
            hasProducts : products.length > 0,
            isAuthenticated : isLoggedIn === undefined ? false : true,
            csrfToken : csrfToken,
            pages : Math.ceil(count / Number(limit)),
            currentPage : currentPage,
            numberOfPreviousPages : paginationValues.numberOfPreviousPages,
            numberOfUpcomingPages : paginationValues.numberOfUpcomingPages,
        });

    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 500);

        console.log(error);

        return next(error);
    }
};

// Update product controller
const updateProductController = async (request : ExtendedRequestInterface, response : Response, next : NextFunction ) => {

    // Get the fields in order to update our product
    const title = request.body.title;
    const price = request.body.price;
    const description = request.body.description;
    const image = request.file;

    // Set the folder path
    const folderPath = `/uploads/${ getFolderPathFromDate() }`;
    const destination = folderPath + request.fileName;
    
    // Check if our Object id is valid in case we do onto a bad link
    // This is more of a pre-emptive fix for production builds
    const isObjectIdValid = ObjectId.isValid(request.params.id);

    // Create a new product Id and guard it
    const productId = isObjectIdValid ? new ObjectId(request.params.id) : null;

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    // Validate our inputs
    const isTitleValid = title.length >= 3;
    const isDescriptionValid = description.length >= 5 && description.length <= 400;
    const isPriceValid = isFloat(Number(price)) || isInt(Number(price));
    const isImageValid = image ? true : false;

    // Check if we're authorised to edit the product, if we are, then update it and go back to the products page
    const product = isObjectIdValid === true ? await Product.findById(productId) : null;
    const hasProduct = product !== null;

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    const filePath = path.join(__dirname, `..${product.image}`);
    
    if (isCSRFValid === true) {

        if (isTitleValid === true && isDescriptionValid === true && isPriceValid === true) {
            
            if (product.userId.toString() === request.session.user._id.toString()) {

                try{

                    // Delete the previous file since we've already added the new one using multer
                    deleteFile(filePath);

                    // Update the product information using mongoose's updateOne method with the id provided previously
                    await Product.updateOne({ _id : productId },{ 
                        title : title,
                        price : price,
                        description : description,
                        image : isImageValid ? destination : undefined
                    });

                    // Render the view of the page
                    response.redirect("/admin/products");

                }catch(err){

                    console.clear();
                    console.log("There's been a server error, please view below");
                    console.log("\n");
            
                    // Custom error object
                    const error = new CustomError(err.message, 500);
            
                    console.log(error);
            
                    return next(error);
                }
            }
        }else{

            // Render the edit products template
            response.render(      
                "pages/admin/edit-product", 
                { 
                    pageTitle : "Edit Products", 
                    id : productId, 
                    productInformation : {
                        title : title,
                        price : price,
                        description : description
                    },
                    hasProducts : hasProduct,
                    isAuthenticated : isLoggedIn === undefined ? false : true,
                    csrfToken : sessionCSRFToken,
                    isSubmitted : true,
                    inputsValid : {
                        isTitleValid : isTitleValid,
                        isPriceValid : isPriceValid,
                        isDescriptionValid : isDescriptionValid,
                        isImageValid : isImageValid
                    }
                }
            );
        }

    }else{

        response.status(403).send("CSRF protection failed!");
    }
};

// Delete product controller
const deleteProduct = async ( request : ExtendedRequestInterface, response : Response, next : NextFunction ) => {

    // Check if our Object id is valid in case we do onto a bad link
    // This is more of a pre-emptive fix for production builds
    const isObjectIdValid = ObjectId.isValid(request.params.id);

    // Instantiate the User that we have
    const user = request.session.user;

    // Check if we have any users that work with the session
    const hasUser = user !== undefined;

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        // Create a new product Id and guard it
        const productId = isObjectIdValid ? new ObjectId(request.params.id) : null;

        try{

            // Check if we're authorised to edit the product, if we are, then update it and go back to the products page
            const product = await Product.findById(productId);

            if (hasUser === true && product.userId.toString() === request.session.user._id.toString()) {

                // Create the filepath for the image
                const filePath = path.join(__dirname, `..${product.image}`);

                // Delete the file from the server
                deleteFile(filePath);

                // Delete the file if it exists by using unlinkSync
                // Only do this if the file already exists on the server
                await Product.deleteOne( {_id : productId} );

                // Redirect to the admin products page since we executed admin functionality
                response.redirect("/admin/products");
            }else{

                // Redirect to the products page
                response.redirect("back");
            }

        }catch(err){

            console.clear();
            console.log("There's been a server error, please view below");
            console.log("\n");
    
            // Custom error object
            const error = new CustomError(err.message, 500);
    
            console.log(error);
    
            return next(error); 
        }

    }else{

        response.status(403).send("CSRF protection failed!");
    }
};

// Get admin edit product controller
const getAdminEditProduct = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // csrfToken from our session
    const csrfToken = request.session.csrfToken;

    // Check if our Object id is valid in case we do onto a bad link
    // This is more of a pre-emptive fix for production builds
    const isObjectIdValid = ObjectId.isValid(request.params.id);

    // Create a new product Id and guard it
    const productId = isObjectIdValid ? new ObjectId(request.params.id) : null;

    try{

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
                    isDescriptionValid : true,
                    isPriceValid : true,
                    isImageValid : true
                }
            }
        );

    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 500);

        console.log(error);

        return next(error); 
    }
};

export { getAddProduct, postAddProduct, getProducts, updateProductController, deleteProduct, getAdminEditProduct }; 