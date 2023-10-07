// import our express types for TypeScript use
import { Response, NextFunction } from 'express';
import Product from '../models/products';
import { ObjectId } from 'mongodb';
import { ExtendedRequestInterface } from '../@types';


// Add product controller
const getAddProduct = ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Send our HTML file to the browser
    response.render("admin/add-product", { 
        pageTitle: "Add Product", 
        path: "/admin/add-product", 
        isAuthenticated : isLoggedIn === undefined ? false : true,
        csrfToken : csrfToken
    });
};

// Post add product controller
const postAddProduct = async( request : ExtendedRequestInterface, response : Response ) => {

    // Fields
    const title = request.body.title;
    const image = request.body.image;
    const price = Number(request.body.price);
    const description = request.body.description;

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    // Instantiate the User that we have
    const user = request.session.user;

    if (isCSRFValid === true) {

        // Check if we have a user
        const hasUser = user !== undefined;

        // Instantiate our product
        const product = new Product({
            title : title,
            image : image,
            description : description,
            price : price,
            userId : hasUser === true ? request.session.user._id : new ObjectId(null) 
        });

        // Save our new product to the database
        // Note : This method is inherited from the Mongoose model
        // Only save the product if we're logged in
        if (hasUser === true) {
            product.save();
        }

        response.redirect("/products");

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Get admin products controller
const getProducts = async ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Instantiate the User that we have
    const user = request.session.user;

    // Check if we have any users that work with the session
    const hasUser = user !== undefined;

    // Find the product. If we need to find a collection, we can pass the conditionals through in an object
    const products = await Product.find({userId : new ObjectId(hasUser === true ? user._id : null)})
    .select("title price _id description image")
    .populate("userId", "name");

    // Render the view of the page
    response.render("admin/products", { 
        prods : products, 
        pageTitle : "Admin Products", 
        hasProducts : products.length > 0,
        isAuthenticated : isLoggedIn === undefined ? false : true,
        csrfToken : csrfToken
    });
};

// Update product controller
const updateProduct = async (request : ExtendedRequestInterface, response : Response ) => {

    // Get the fields in order to update our product
    const title = request.body.title;
    const price = request.body.price;
    const description = request.body.description;
    const image = request.body.image;

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

    if (isCSRFValid === true) {

        // Check if we're authorised to edit the product, if we are, then update it and go back to the products page
        const product = await Product.findById(productId);

        if (product.userId.toString() === request.session.user._id.toString()) {

            // Update the product information using mongoose's updateOne method with the id provided previously
            await Product.updateOne({ _id : productId },{ 
                title : title,
                price : price,
                description : description,
                image : image
            });

            // Render the view of the page
            console.log("Updated products");
            response.redirect("/admin/products");
        }else{

            response.redirect("back");
        }

    }else{

        response.status(403).send("CSRF protection failed!");
    }
};

// Delete product controller
const deleteProduct = async ( request : ExtendedRequestInterface, response : Response ) => {

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

        // Check if we're authorised to edit the product, if we are, then update it and go back to the products page
        const product = await Product.findById(productId);

        if (hasUser === true && product.userId.toString() === request.session.user._id.toString()) {

            await Product.deleteOne( {_id : productId} );

            // Redirect to the admin products page since we executed admin functionality
            response.redirect("/admin/products");
        }else{

            // Redirect to the products page
            response.redirect("back");
        }

    }else{

        response.status(403).send("CSRF protection failed!");
    }
};

export { getAddProduct, postAddProduct, getProducts, updateProduct, deleteProduct }; 