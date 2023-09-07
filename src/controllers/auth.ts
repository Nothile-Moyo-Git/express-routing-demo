// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import bcrypt from "bcrypt";

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
    email : string
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
        passwordInput : string

    },
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionData>
}

// Get login page controller
const getLoginPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Render the login page here
    // Note: Don't use a forward slash when defining URL's here
    response.render("auth/login", { pageTitle : "Login", isAuthenticated : true });
};

// Post login page controller
const postLoginAttemptController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get email address and password
    const email = request.body.emailInput;
    const password = request.body.passwordInput;

    // Get a list of users
    const users = await User.find({_id : new ObjectId(request.User._id)});

    // We define these variables here as we need to scope them correctly as we validate the user
    let isPasswordValid : boolean = false;
    let isEmailValid : boolean = false; 
    let currentUser : SessionUser | undefined = undefined;

    users.forEach((user : UserInterface) => {

        // Compare the submitted password to the hashed password
        if (bcrypt.compareSync(password, user.password)) {
            isPasswordValid = true;
        }

        // Compare the email address without being case sensitive, if the result is 0, then the comparison is true
        if (email.localeCompare(request.User.email, undefined, { sensitivity: 'base' }) === 0) {
            isEmailValid = true;
        }

        if (isPasswordValid === true && isEmailValid === true) {
            currentUser = {
                _id : user._id,
                name : user.name,
                email : user.email
            }
        }
    });

    // Set is logged in to true and pass the user id through as well to the session
    if (isPasswordValid && isEmailValid) {

        request.session.user = currentUser;
        request.session.isLoggedIn = true;
        response.redirect("products");
    } else {
        response.redirect('back');
    }
};

// Export the controllers
export { getLoginPageController, postLoginAttemptController };