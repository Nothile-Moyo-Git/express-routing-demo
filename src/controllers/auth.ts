// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import bcrypt from "bcrypt";

// Extending session data as opposed to declaration merging
interface ExtendedSessionData extends SessionData {
    test : boolean
}

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
interface ExtendedRequest extends Request{
    User : UserInterface,
    body : {
        emailInput : string,
        passwordInput : string

    },
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionData>
}

// Get login page controller
const getLoginPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {
    
    console.log("Request session");
    console.log(request.session.test); 

    // Render the login page here
    // Note: Don't use a forward slash when defining URL's here
    response.render("auth/login", { pageTitle : "Login", isAuthenticated : true });
};

// Post login page controller
const postLoginAttemptController = (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get email address and password
    const email = request.body.emailInput;
    const password = request.body.passwordInput;

    // Create a userInstance so we can compare email addresses and passwords
    // Since this is for the singleton, we use request. Normally however, we would use the server session to validate this by querying the user
    const userInstance = new User(request.User);

    // Compare our encrypted password to the one in the database
    const isPasswordValid = bcrypt.compareSync(password, request.User.password);

    // Compare the email address to the one in the database but case insensitive
    const isEmailValid = email.localeCompare(request.User.email, undefined, { sensitivity: 'base' });

    // Use express session page
    request.session.test = true;

    response.redirect('back');
};

// Export the controllers
export { getLoginPageController, postLoginAttemptController };