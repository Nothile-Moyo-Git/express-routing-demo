/**
 * Author : Nothile Moyo
 * Date Created : 01/11/2023
 * License : MIT
 * 
 * The Auth controller, handles requests for anything related to the user such as signups and password resets
 * 
 * @method getLoginPageController = (request : ExtendedRequestInterface, response : Response) => void
 * @method getSignupPageController = (request : ExtendedRequestInterface, response : Response) => void
 * @method getPasswordResetPageController = (request : ExtendedRequestInterface, response : Response) => void
 * @method getPasswordResetRedirectController = (request : ExtendedRequestInterface, response : Response) => void
 * @method getNewPasswordForm = (request : ExtendedRequestInterface, response : Response) => void
 * @method postNewPasswordController = (request : ExtendedRequestInterface, response : Response) => void
 * @method postPasswordResetPageController = (request : ExtendedRequestInterface, response : Response) => void
 * @method postSignupPageController = (request : ExtendedRequestInterface, response : Response) => void
 * @method postLoginAttemptController = (request : ExtendedRequestInterface, response : Response) => void
 * @method postLogoutAttemptController = (request : ExtendedRequestInterface, response : Response) => void
 */

// import our express types for TypeScript use
import { NextFunction, Response } from 'express';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import bcrypt from "bcrypt";
import { validate } from 'email-validator';
import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";
import { sendgridOptions } from "../data/connection";
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import crypto from "crypto";
import { ExtendedRequestInterface, UserInterface } from '../@types';
import CustomError from '../models/error';

// Create a "transporter" object which allows you to send emails
const transporter = nodemailer.createTransport(sgTransport(sendgridOptions));

// Get login page controller
const getLoginPageController = async (request : ExtendedRequestInterface, response : Response) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Decide whether we render the login page or whether we redirect to the shop 
    if (isLoggedIn === undefined) {
        
        // Render the login page here
        // Note: Don't use a forward slash when defining URL's here
        response.render("pages/auth/login", { 
            pageTitle : "Login", 
            isAuthenticated : false, 
            csrfToken : csrfToken, 
            emailError : "",
            passwordError : "",
            oldInput : {}
        });

    }else{

        // If we're already logged in, redirect to the products page
        response.redirect("products");
    }
};

// Get signup page controller
const getSignupPageController = async (request : ExtendedRequestInterface, response : Response) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Decide whether we render the login page or whether we redirect to the shop 
    if (isLoggedIn === undefined) {
        
        // Render the login page here
        // Note: Don't use a forward slash when defining URL's here
        response.render("pages/auth/signup", { 
            pageTitle : "Signup", 
            isAuthenticated : false, 
            emailError : "", 
            passwordError : "", 
            csrfToken : csrfToken,
            oldInput : {} 
        });

    }else{

        // If we're already logged in, redirect to the products page
        response.redirect("products");
    }
};

// Render the password reset page
const getPasswordResetPageController = async ( request : ExtendedRequestInterface, response : Response, next : NextFunction ) => {

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Set the reset token value
    const resetToken = request.params.resetToken;

    try{

        // See if there is a user based on the reset token, if not, then we'll need to pass an error through
        const tempUser : UserInterface = await User.findOne({resetToken : resetToken, resetTokenExpiration : {$gt: Date.now()}});
        const hasUser = tempUser !== null;

        // Render the password reset page
        response.render(
            "pages/auth/password-reset", 
            { 
                pageTitle : "Reset your password",
                csrfToken : csrfToken, 
                isAuthenticated : false,
                emailError : "",
                previousPasswordError : "",
                newPasswordError : "",
                hasUser : hasUser,
                resetToken : resetToken,
                oldInput : {}
            }
        );

    }catch(err){

        console.clear();
        console.log("There's been a server error, please view below");
        console.log("\n");

        // Custom error object
        const error = new CustomError(err.message, 500);

        console.log(error);

        return next(error);
    }
};

// Redirect if we don't have the appropriate paramaters to the new password page
const getPasswordResetRedirectController = async ( request : ExtendedRequestInterface, response : Response ) => {
    response.redirect("/new-password");
};

// Render the new password form
const getNewPasswordForm = async ( request : ExtendedRequestInterface, response : Response ) => {

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Render the new password Form
    response.render("pages/auth/new-password",{
        pageTitle : "Request a new password",
        csrfToken : csrfToken,
        isAuthenticated : isLoggedIn,
        userExists : "",
        isSubmitted : "",
        oldInput : {}
    }); 
};

// Send the email which redirects to the password reset page
const postNewPasswordController =  async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // csrfToken from our session
    const sessionCSRFToken : string = request.session.csrfToken;
    const requestCSRFToken : string = String(request.body.csrfToken).replace(/\/$/, "");  

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get our inputs so we can verify and check them
    const emailAddress : string = request.body.emailInput;

    // Check if our csrf values are correct
    const isCSRFValid : boolean = sessionCSRFToken === requestCSRFToken;

    // CSRF protection
    if (isCSRFValid === true) {

        try{

            // See if we have a user in our database with the email address
            const tempUser = await User.findOne({email : emailAddress});

            // If we have a user, then save a reset token we're going to use later
            // If we don't have a user, then reload the page
            if ( tempUser !== null ) {

                // Create our token
                const token = crypto.randomBytes(32).toString("hex");

                // Set the variables we're going to save to the User object
                // Our expiration date is 1 day after we set the token
                tempUser.resetToken = token;
                tempUser.resetTokenExpiration = new Date(Date.now() + 86400000);

                // Update the user with the reset tokens so we can update their password later
                await tempUser.save();

                // Testing and debugging code
                const options = {
                    to : [emailAddress],
                    from: "nothile1@gmail.com",
                    subject : "Password Reset",
                    text : "Password reset request",
                    html : `
                        <h1>You have requested a password reset</h1>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password</p>
                    `
                };

                // Send the email from sendgrid
                transporter.sendMail(options, (error : Error, response : SMTPTransport.SentMessageInfo) => {

                    // Email handling
                    if (error) {

                        console.clear();
                        console.log("There was an error sending your email");
                        console.log(error);
                    }else{
                        console.clear();
                        console.log("Email successful, response below");
                        console.log(response);
                    }
                });

                // Render the new password Form
                response.render("pages/auth/new-password",{
                    pageTitle : "Request a new password",
                    csrfToken : sessionCSRFToken,
                    isAuthenticated : isLoggedIn,
                    userExists : "true",
                    isSubmitted : "true",
                    modalClassNames : "modal",
                    modalText : "Success : Email has been sent to the user",
                    oldInput : {
                        oldEmail : emailAddress
                    }
                }); 

            }else{

                // Render the new password Form
                response.render("pages/auth/new-password",{
                    pageTitle : "Request a new password",
                    csrfToken : sessionCSRFToken,
                    isAuthenticated : isLoggedIn,
                    userExists : "",
                    isSubmitted : "true",
                    modalClassNames : "modal modal--error",
                    modalText : "Error : User doesn't exist with that email address",
                    oldInput : {
                        oldEmail : emailAddress
                    }
                }); 
            }

        }catch(err){

            console.clear();
            console.log("There's been a server error, please view below");
            console.log("\n");
    
            // Custom error object
            const error = new CustomError(err.message, 500);
    
            console.log(error);
    
            return next(error);
        }
    }else{

        response.status(403).send("CSRF protection failed!");
    }
};

// Handle the password reset functionality
const postPasswordResetPageController = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // csrfToken from our session
    const sessionCSRFToken : string = request.session.csrfToken;
    const requestCSRFToken : string = String(request.body.csrfToken).replace(/\/$/, "");
    const resetToken : string = request.body.resetToken;
    
    // Check if our csrf values are corre ct
    const isCSRFValid : boolean = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        try{

            // We define these variables here as we need to scope them correctly as we validate the user
            let isPasswordValid = false;
            let passwordUpdated = false;
            let hasUser = false;
            
            // Get our inputs so we can verify and check them
            const previousPassword : string = request.body.previousPasswordInput;
            const newPassword : string = request.body.newPasswordInput;
            const confirmNewPassword : string = request.body.confirmNewPasswordInput;
            const passwordsMatch : boolean = newPassword === confirmNewPassword;

            // See if we have a user in our database with the email address
            const tempUser = await User.findOne({resetToken : resetToken, resetTokenExpiration : {$gt: Date.now()}});

            // Check if the password works
            if (tempUser !== null) {

                hasUser = true;

                // Compare the submitted password to the hashed password
                if (bcrypt.compareSync(previousPassword, tempUser.password) === true) {

                    // Set the password to valid for our error handling on the view
                    isPasswordValid = true;

                    // The final check, the reset tokens are valid, csrf protection is valid, passwords have been checked with bcrypt encryption and they're the same
                    if (passwordsMatch === true) {

                        // Create a new password and update it in the user
                        // Also, reset our token and expiration date
                        const updatedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8));
                        tempUser.password = updatedPassword;
                        tempUser.resetToken = undefined;
                        tempUser.resetTokenExpiration = undefined;

                        await tempUser.save();

                        // Redirect to the login page once we've updated the password
                        passwordUpdated = true;
                    }
                }

            }else{

                isPasswordValid = true;
            }

            if (passwordUpdated === true) {

                // Redirect to the login page if we successfully reset our password
                response.redirect("login");
                
            }else{

                // Render the password reset page
                response.render( "pages/auth/password-reset", { 
                    pageTitle : "Reset your password",
                    csrfToken : sessionCSRFToken, 
                    isAuthenticated : false,
                    emailError : hasUser ? "" : "Error : Email address not found in the database",
                    previousPasswordError : isPasswordValid ? "" : "Error : Previous password is wrong",
                    newPasswordError : passwordsMatch ? "" : "Error : Passwords don't match",
                    hasUser : hasUser,
                    resetToken : resetToken,
                    oldInput : {
                        oldPreviousPassword : previousPassword,
                        oldNewPassword : newPassword,
                        oldConfirmNewPassword : confirmNewPassword
                    }
                });
            }

        }catch(err){

            console.clear();
            console.log("There's been a server error, please view below");
            console.log("\n");
    
            // Custom error object
            const error = new CustomError(err.message, 500);
    
            console.log(error);
    
            return next(error);
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Post signup page controller, handles the signup form submission
const postSignupPageController = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Get the fields from the form submission
    const tempUser = await User.findOne({email : request.body.emailInput});
    const isEmailValid = (validate(request.body.emailInput) && tempUser === null); 
    const passwordsMatch = request.body.passwordInput === request.body.secondPasswordInput;
    const isPasswordLengthValid = (request.body.passwordInput.length >= 6) && (request.body.secondPasswordInput.length >= 6);

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        // If our validation checks are valid, then we redirect to the login page since we've created a new user
        if (isEmailValid === true && passwordsMatch === true && isPasswordLengthValid === true && tempUser === null) {

            try{

                // Create a new user since our checks are valid
                const newUser = new User({
                    name : request.body.nameInput,
                    email : request.body.emailInput,
                    password : bcrypt.hashSync(request.body.passwordInput, bcrypt.genSaltSync(8)),
                    cart : {
                        items : [],
                        totalPrice : 0
                    }
                });

                // Save the new user to the database
                await newUser.save();

                // Testing and debugging code
                const options = {
                    to : [request.body.emailInput],
                    from: "nothile1@gmail.com",
                    subject : "Signup successful",
                    text : "Congratulations, you successfully signed up",
                    html : `<div>
                                <h1>Good job on your successful signup :)</h1>
                                </br>
                                <p>Proceed to the login page to use your new account</p>
                            <div>`
                };

                // Send the email from sendgrid
                transporter.sendMail(options, (error : Error, response : SMTPTransport.SentMessageInfo) => {

                    // Email handling
                    if (error) {

                        console.clear();
                        console.log("There was an error sending your email");
                        console.log(error);
                    }else{
                        console.clear();
                        console.log("Email successful, response below");
                        console.log(response);
                    }
                });
                
                // Go the login page since we now have a valid check
                response.redirect("/login");

            }catch(err){

                console.clear();
                console.log("There's been a server error, please view below");
                console.log("\n");
        
                // Custom error object
                const error = new CustomError(err.message, 500);
        
                console.log(error);
        
                return next(error);
            }

        }else{

            // Set the error message using a ternary operator based on if we already have a user with the same email or not
            const emailErrorMessage = tempUser === null ? "Error : Email address isn't valid" : "Error : Email address is already in use";

            // Set our flash messages
            let passwordError = "";
            !passwordsMatch && (passwordError = "Error : Passwords don't match");
            !isPasswordLengthValid && (passwordError = "Error : Both passwords must be at least 6 characters long");
        
            // Render the login page here
            // Note: Don't use a forward slash when defining URL's here
            response.render("pages/auth/signup", { 
                pageTitle : "Signup", 
                isAuthenticated : false, 
                emailError : emailErrorMessage, 
                passwordError : passwordError, 
                csrfToken : sessionCSRFToken, 
                oldInput : {
                    oldName : request.body.nameInput,
                    oldEmail : request.body.emailInput,
                    oldPassword : request.body.passwordInput,
                    oldConfirmPassword : request.body.secondPasswordInput
                } 
            });
            
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Post login page controller
const postLoginAttemptController = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Get email address and password
    const email = request.body.emailInput;
    const password = request.body.passwordInput;

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        try{

            // Get our current User from the backend
            const user = await User.findOne({email : email.toLowerCase()});

            // Make sure that we have a user before we reference their properties
            if (user !== null) {

                // We define these variables here as we need to scope them correctly as we validate the user
                let isPasswordValid = false;
                let isEmailValid = false;
                let currentUser : UserInterface | undefined = undefined;

                // Compare the submitted password to the hashed password
                if (bcrypt.compareSync(password, user.password)) {
                    isPasswordValid = true;
                }

                // Compare the email address without being case sensitive, if the result is 0, then the comparison is true
                if (email.localeCompare(email, undefined, { sensitivity: 'base' }) === 0) {
                    isEmailValid = true;
                }

                // If our password and emails are valid
                if (isPasswordValid === true && isEmailValid === true) {
                    currentUser = {
                        _id : new ObjectId(user._id),
                        name : user.name,
                        email : user.email,
                        cart : user.cart
                    }
                }

                // Set is logged in to true and pass the user id through as well to the session
                if (isPasswordValid === true && isEmailValid === true) {

                    // Set the user in the current session
                    request.session.user = currentUser;
                    request.session.isLoggedIn = true;
                    request.session.cart = {
                        userId : new ObjectId(currentUser._id),
                        totalPrice : currentUser.cart.totalPrice,
                        items : currentUser.cart.items
                    }
                    response.redirect("products");

                } else {

                    // Reload the login page
                    // We do it like this in order to pass the previous input through without using a flash message
                    response.render("pages/auth/login", { 
                        pageTitle : "Login", 
                        isAuthenticated : false, 
                        csrfToken : sessionCSRFToken, 
                        emailError : !isEmailValid ? "Error : Email address isn't a valid format" : "",
                        passwordError : !isPasswordValid ? "Error : Password isn't valid" : "",
                        oldInput : {
                            oldEmail : email,
                            oldPassword : password
                        }
                    });
                }

            }else{

                // Set the flash messages for our email address and password
                request.flash("emailError", "Error : User doesn't exist in the database");

                // Reload the login page
                response.render("pages/auth/login", { 
                    pageTitle : "Login", 
                    isAuthenticated : false, 
                    csrfToken : sessionCSRFToken, 
                    emailError : "Error : User doesn't exist in the database",
                    passwordError : "",
                    oldInput : {
                        oldEmail : email,
                        oldPassword : password
                    }
                });
            }
        }catch(err){

            console.clear();
            console.log("There's been a server error, please view below");
            console.log("\n");
    
            // Custom error object
            const error = new CustomError(err.message, 500);
    
            console.log(error);
    
            return next(error);
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Logout page controller
const postLogoutAttemptController = async (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");

    console.clear();
    console.log("Request body");
    console.log(request.body);
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        // Wrap this functionality in a try catch block just to be safe with the added guarding
        try {

            // Destroy the session in the database
            request.session.destroy((error : unknown) => {

                if (!error) {

                    // Clear the cookie in our browser as well
                    response.clearCookie("Adeptus");

                    response.redirect("login");
                }
            });
            
        }catch(err){

            console.clear();
            console.log("There's been a server error, please view below");
            console.log("\n");
    
            // Custom error object
            const error = new CustomError(err.message, 500);
    
            console.log(error);
    
            return next(error);
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Export the controllers
export { 
    getLoginPageController, 
    postLoginAttemptController, 
    postLogoutAttemptController, 
    getSignupPageController, 
    postSignupPageController, 
    getPasswordResetPageController, 
    postPasswordResetPageController, 
    getNewPasswordForm, 
    postNewPasswordController,
    getPasswordResetRedirectController
};
