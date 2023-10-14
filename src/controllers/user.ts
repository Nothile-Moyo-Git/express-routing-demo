// import our express types for TypeScript use
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import { ExtendedRequestInterface, UserInterface } from '../@types';
import { validate } from 'email-validator';

// Handle our get profile page
const getProfilePageController = ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our csrf token
    const csrfToken = request.session.csrfToken;

    // Get our user information so we can describe it on the profile page
    const userData : UserInterface = request.session.user;

    // Check if the user is logged in so we determine which menu we want to show, if we don't do this we always show the logged in menu even if we're not
    const isLoggedIn = request.session.isLoggedIn;

    response.render("pages/user/profile-page", {
        pageTitle : "Profile Page",
        csrfToken : csrfToken,
        isAuthenticated : isLoggedIn,
        userData : userData
    });
};

// Handle our edit profile page controller
const getEditProfilePageController = ( request : ExtendedRequestInterface, response : Response ) => {

    // Get our csrf token
    const csrfToken = request.session.csrfToken;

    // Get our user information so we can describe it on the profile page
    const userData : UserInterface = request.session.user;

    const isLoggedIn = request.session.isLoggedIn;

    response.render("pages/user/edit-profile-page", {
        pageTitle : "Edit Profile",
        csrfToken : csrfToken,
        userData : userData,
        isNameValid : true,
        isEmailValid : true,
        isFormSubmitted : false,
        isAuthenticated : isLoggedIn
    });
};

// Handle out edit profile post request
const postEditProfileRequestController = ( request : ExtendedRequestInterface, response : Response ) => {

    // Validate inputs 
    const isNameValid = request.body.nameInput.length >= 3;
    const isEmailValid = validate(request.body.emailInput);

    // Get our csrf token
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = request.body.csrfToken;

    // Get our user information so we can describe it on the profile page
    const userData : UserInterface = request.session.user;

    const isLoggedIn = request.session.isLoggedIn;

    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true){
        response.render("pages/user/edit-profile-page", {
            pageTitle : "Edit Profile",
            csrfToken : sessionCSRFToken,
            userData : userData,
            isNameValid : isNameValid,
            isEmailValid : isEmailValid,
            isFormSubmitted : true,
            isAuthenticated : isLoggedIn
        });
    }else{

        response.status(403).send("CSRF protection failed!");
    }

};

export { getProfilePageController, getEditProfilePageController, postEditProfileRequestController };