// Import our types
import { Response, NextFunction } from 'express';
import { ExtendedRequestInterface } from '../@types';

export default (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // If we're not logged in, then take us back to the login page, we execute this before we execute the subsequent middleware
    // This allows us to create a re-usable means of validating our isLoggedIn value in our session
    if (!request.session.isLoggedIn) {

        return response.redirect("/login");
    }

    next();
}