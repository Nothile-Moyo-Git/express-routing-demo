// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import bcrypt from "bcrypt";
import { validate } from 'email-validator';

// Cart items interface
interface CartItem {
    productId : ObjectId,
    title : string,
    quantity : number,
    price : number
}

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string,
    password : string,
    cart : {
        totalPrice : number,
        items : CartItem[]
    }
}

// Session user
interface SessionUser {
    _id : Object,
    name : string,
    email : string,
    cart : {
        totalPrice : number,
        items : CartItem[]
    }
}

// Extending session data as opposed to declaration merging
interface ExtendedSessionData extends SessionData {
    isLoggedIn : boolean,
    user : SessionUser
}
interface ExtendedRequest extends Request{
    User : UserInterface,
    body : {
        emailInput : string,
        passwordInput : string,
        secondPasswordInput : string
    },
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionData>,
    emailAddressValid : boolean,
    passwordsMatch : boolean
}

// Get login page controller
const getLoginPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Decide whether we render the login page or whether we redirect to the shop 
    if (isLoggedIn === undefined) {
        
        // Render the login page here
        // Note: Don't use a forward slash when defining URL's here
        response.render("auth/login", { pageTitle : "Login", isAuthenticated : false });
    }else{

        // If we're already logged in, redirect to the products page
        response.redirect("products");
    }
};

// Get signup page controller
const getSignupPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Decide whether we render the login page or whether we redirect to the shop 
    if (isLoggedIn === undefined) {
        
        // Render the login page here
        // Note: Don't use a forward slash when defining URL's here
        response.render("auth/signup", { pageTitle : "Signup", isAuthenticated : false });
    }else{

        // If we're already logged in, redirect to the products page
        response.redirect("products");
    }
};

// Post signup page controller, handles the signup form submission
const postSignupPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {


    response.redirect("back");
};

// Post login page controller
const postLoginAttemptController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get email address and password
    const email = request.body.emailInput;
    const password = request.body.passwordInput;

    // Get a list of users
    const users = await User.find({email : email.toLowerCase()});

    // We define these variables here as we need to scope them correctly as we validate the user
    let isPasswordValid : boolean;
    let isEmailValid : boolean; 
    let currentUser : SessionUser | undefined = undefined;

    users.forEach((user : UserInterface) => {

        // Compare the submitted password to the hashed password
        if (bcrypt.compareSync(password, user.password)) {
            isPasswordValid = true;
        }

        // Compare the email address without being case sensitive, if the result is 0, then the comparison is true
        if (email.localeCompare(email, undefined, { sensitivity: 'base' }) === 0) {
            isEmailValid = true;
        }

        if (isPasswordValid === true && isEmailValid === true) {
            currentUser = {
                _id : new ObjectId(user._id),
                name : user.name,
                email : user.email,
                cart : user.cart
            }
        }
    });

    // Set is logged in to true and pass the user id through as well to the session
    if (isPasswordValid === true && isEmailValid === true) {

        request.session.user = currentUser;
        request.session.isLoggedIn = true;
        response.redirect("products");
    } else {
        response.redirect('back');
    }
};

// Logout page controller
const getLogoutAttemptController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Wrap this functionality in a try catch block just to be safe with the added guarding
    try {

        // Destroy the session in the database
        request.session.destroy((error : unknown) => {

            if (!error) {

                // Clear the cookie in our browser as well
                response.clearCookie("Adeptus");

                response.redirect("login");
            }
        });
        
    }catch(error : unknown){

        console.clear();
        console.error("Error : Logout functionality failed, please contact the development team");

        // Go back to the page we were previously on
        response.redirect("back");
    }
};

// Export the controllers
export { getLoginPageController, postLoginAttemptController, getLogoutAttemptController, getSignupPageController, postSignupPageController };