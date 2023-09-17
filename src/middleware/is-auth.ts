// Import our types
import { Request, Response, NextFunction } from 'express';
import { SessionData, Session } from 'express-session';

// Extending session data as opposed to declaration merging
interface ExtendedSessionData extends SessionData {
    isLoggedIn : boolean
}

// Defining our interfaces
interface ExtendedRequest extends Request{
    session : Session & Partial<ExtendedSessionData>
}

export default (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // If we're not logged in, then take us back to the login page, we execute this before we execute the subsequent middleware
    // This allows us to create a re-usable means of validating our isLoggedIn value in our session
    if (!request.session.isLoggedIn) {

        return response.redirect("/login");
    }

    next();
}