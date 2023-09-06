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
const postLoginAttemptController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get email address and password
    const email = request.body.emailInput;
    const password = request.body.passwordInput;

    const users = await User.find({_id : new ObjectId(request.User._id)});

    // We define these variables here as we need to scope them correctly as we validate the user
    let isPasswordValid : boolean, isEmailValid : boolean = false;

    users.forEach((user : UserInterface) => {

        // Compare the submitted password to the hashed password
        isPasswordValid = bcrypt.compareSync(password, user.password);

        // Compare the email address without being case sensitive, if the result is 0, then the comparison is true
        isEmailValid = email.localeCompare(request.User.email, undefined, { sensitivity: 'base' }) === 0;
    });

    // Use express session page
    request.session.test = true;

    response.redirect('back');
};

// Export the controllers
export { getLoginPageController, postLoginAttemptController };