// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import Product from '../models/products';
import { ObjectId } from 'mongodb';
import { Session, SessionData } from "express-session";

// Cart items interface
interface CartItem {
    productId : ObjectId,
    title : string,
    quantity : number,
    price : number
}

// Session user
interface SessionUser {
    _id : ObjectId,
    name : string,
    email : string
}

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string
    cart : {
        totalPrice : number,
        items : CartItem[]
    }
}

// Extending session data as opposed to declaration merging
interface ExtendedSessionData extends SessionData {
    isLoggedIn : boolean,
    user : SessionUser,
    csrfToken : string
}

interface ExtendedRequest extends Request{
    User : UserInterface,
    body : {
        title : string,
        image : string,
        price : number,
        description : string
    }
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionData>
}

// Add product controller
const getAddProduct = (request : ExtendedRequest, response : Response, next : NextFunction) => {

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
const postAddProduct = async(request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Fields
    const title = request.body.title;
    const image = request.body.image;
    const price = Number(request.body.price);
    const description = request.body.description;

    // Instantiate the User that we have
    const user = request.session.user;

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
};

// Get admin products controller
const getProducts = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

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
const updateProduct = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

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

    // Update the product information using mongoose's updateOne method with the id provided previously
    await Product.updateOne({ _id : productId },{ 
        title : title,
        price : price,
        description : description,
        image : image
    });

    // Render the view of the page
    response.redirect("/admin/products");
};

// Delete product controller
const deleteProduct = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Check if our Object id is valid in case we do onto a bad link
    // This is more of a pre-emptive fix for production builds
    const isObjectIdValid = ObjectId.isValid(request.params.id);

    // Instantiate the User that we have
    const user = request.session.user;

    // Check if we have any users that work with the session
    const hasUser = user !== undefined;

    // Create a new product Id and guard it
    const productId = isObjectIdValid ? new ObjectId(request.params.id) : null;

    if (hasUser === true) {
        await Product.deleteOne( {_id : productId} );
    }

    // Redirect to the admin products page since we executed admin functionality
    response.redirect("/admin/products");
};

export { getAddProduct, postAddProduct, getProducts, updateProduct, deleteProduct }; 