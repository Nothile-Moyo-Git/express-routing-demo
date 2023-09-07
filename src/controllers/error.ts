/**
 * Error controller
 * Handles the 404 page which can't be routed
 * It does this by handling all routes which aren't handled in the previous route handlers
 * Note: Please ensure that this route is checked last, as it will override any routes you define after it
 * 
 * @method getError : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
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
    _id : Object,
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
    user : SessionUser
}

interface ExtendedRequest extends Request{
    User : UserInterface,
    body : {
        productId : ObjectId
    }
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionData>
}

// Get error page controller
const getError = (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // If the page has a 404 error, then output an error page instead of crashing the server
    response.render('404', { pageTitle: "Error", isAuthenticated : isLoggedIn === undefined ? false : true });
}

export { getError };