// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';
import { ObjectId } from 'mongodb';
import { password } from "../data/connection";
import User from '../models/user';

// Extending session data as opposed to declaration merging
interface ExtendedSessionData extends SessionData {
    test : boolean
}

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string
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
    
    // Remove the equals sign from the isAuthenticated cookie
    const cookie = String(request.get("Cookie")).trim().split("=")[1];

    // Convert the string to a boolean
    const isAuthenticated = (cookie === "true");

    /*
    console.clear();
    console.log("Request session");
    console.log(request.session.test); */

    // Render the login page here
    // Note: Don't use a forward slash when defining URL's here
    response.render("auth/login", { pageTitle : "Login", isAuthenticated : isAuthenticated });
};

// Post login page controller
const postLoginAttemptController = (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get email address and password
    // const email = request.body.emailInput;
    // const password = request.body.passwordInput;

    // Create a userInstance so we can compare email addresses and passwords
    // Since this is for the singleton, we use request. Normally however, we would use the server session to validate this by querying the user
    const userInstance = new User(request.User);

    /*
    console.clear();
    console.log("User data");
    console.log(userInstance);
    console.log("Request body");
    console.log(request.body); */

    // Once the user is validated, we set isAuthenticated to true and pass it though
    // By extending our request, we can add it to every query
    request.isAuthenticated = true;

    // Use express session page
    // request.session.test = true;

    // Set the cookie in our response as opposed to request
    response.setHeader("Set-Cookie", `isAuthenticated = ${request.isAuthenticated}`);

    response.redirect("products");
};

// Export the controllers
export { getLoginPageController, postLoginAttemptController };