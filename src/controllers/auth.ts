// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string
}

interface RequestWithUser extends Request{
    User : UserInterface
}

// Get login page controller
const getLoginPageController = (request : RequestWithUser, response : Response, next : NextFunction) => {
    
    // Render the login page here
    // Note: Don't use a forward slash when defining URL's here
    response.render("auth/login", { pageTitle : "Login" });
}

export { getLoginPageController };