// import our express types for TypeScript use
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import { ExtendedRequestInterface, UserInterface } from '../@types';

// Handle our get profile page
const getProfilePageController = ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our csrf token
    const csrfToken = request.session.csrfToken;

    // Check if the user is logged in so we determine which menu we want to show, if we don't do this we always show the logged in menu even if we're not
    const isLoggedIn = request.session.isLoggedIn;

    response.render("pages/user/profile-page",{
        pageTitle : "Profile Page",
        csrfToken : csrfToken,
        isAuthenticated : isLoggedIn
    });
};

export { getProfilePageController };