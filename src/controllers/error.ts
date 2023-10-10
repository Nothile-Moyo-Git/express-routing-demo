/**
 * Error controller
 * Handles the 404 page which can't be routed
 * It does this by handling all routes which aren't handled in the previous route handlers
 * Note: Please ensure that this route is checked last, as it will override any routes you define after it
 * 
 * @method getError : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Response } from 'express';
import { ExtendedRequestInterface } from '../@types';

// Get error page controller
const getError = (request : ExtendedRequestInterface, response : Response ) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session and attach it (although it's not really necessary unless we're logged in)
    const csrfToken = request.session.csrfToken;

    // If the page has a 404 error, then output an error page instead of crashing the server
    response.render('404', { 
        pageTitle: "Error", 
        isAuthenticated : isLoggedIn === undefined ? false : true,
        csrfToken : csrfToken
    });
}

export { getError };