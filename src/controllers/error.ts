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

// Get error page controller
const getError = (request : Request, response : Response, next : NextFunction) => {

    // Remove the equals sign from the isAuthenticated cookie
    const cookie = request.get("Cookie").trim().split("=")[1];

    // Convert the string to a boolean
    const isAuthenticated = (cookie === "true");

    // If the page has a 404 error, then output an error page instead of crashing the server
    response.render('404', { pageTitle: "Error", isAuthenticated : isAuthenticated });
}

export { getError };