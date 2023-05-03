/**
 * Error controller
 * Handles requests and routing 
 * 
 * @method getError : (request : Request, response : Response, next : NextFunction) => void
 */

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

// Get error page controller
const getError = (request : Request, response : Response, next : NextFunction) => {

    // If the page has a 404 error, then output an error page instead of crashing the server
    response.render('404', { pageTitle: "Error" });
}

export { getError };