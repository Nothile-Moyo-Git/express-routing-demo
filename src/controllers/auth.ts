// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import bcrypt from "bcrypt";
import { validate } from 'email-validator';
import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";
import { sendgridOptions } from "../data/connection";
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import crypto from "crypto";

// Cart items interface
interface CartItem {
    productId : ObjectId,
    title : string,
    quantity : number,
    price : number
}

// Extend the request object in order to set variables in my request object
interface UserInterface {
    _id : ObjectId,
    name : string,
    email : string,
    password : string,
    cart : {
        totalPrice : number,
        items : CartItem[]
    }
    resetToken : string,
    resetTokenExpiration : Date
}

// Session user
interface SessionUser {
    _id : Object,
    name : string,
    email : string,
    cart : {
        totalPrice : number,
        items : CartItem[]
    }
}

// Extending session data as opposed to declaration merging
interface ExtendedSessionData extends SessionData {
    isLoggedIn : boolean,
    user : SessionUser,
    csrfToken : string
}
interface ExtendedRequest extends Request{
    User : UserInterface,
    body : {
        emailInput : string,
        passwordInput : string,
        secondPasswordInput : string,
        nameInput : string,
        csrfToken : string,
        previousPasswordInput ?: string,
        newPasswordInput ?: string,
        confirmNewPasswordInput ?: string,
        resetToken : string
    },
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionData>,
    emailAddressValid : boolean,
    passwordsMatch : boolean,
}

// Create a "transporter" object which allows you to send emails
const transporter = nodemailer.createTransport(sgTransport(sendgridOptions));

// Get login page controller
const getLoginPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Convert values to a string, we do this because we otherwise get the flash data type which we can't get the length of
    const emailError : string = request.flash("emailError").toString();
    const passwordError : string = request.flash("passwordError").toString();

    // Decide whether we render the login page or whether we redirect to the shop 
    if (isLoggedIn === undefined) {
        
        // Render the login page here
        // Note: Don't use a forward slash when defining URL's here
        response.render("auth/login", { 
            pageTitle : "Login", 
            isAuthenticated : false, 
            csrfToken : csrfToken, 
            emailError : emailError,
            passwordError : passwordError
        });

    }else{

        // If we're already logged in, redirect to the products page
        response.redirect("products");
    }
};

// Get signup page controller
const getSignupPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Decide whether we render the login page or whether we redirect to the shop 
    if (isLoggedIn === undefined) {
        
        // Render the login page here
        // Note: Don't use a forward slash when defining URL's here
        response.render("auth/signup", { 
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
const getPasswordResetPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Set the reset token value
    const resetToken = request.params.resetToken;

    // See if there is a user based on the reset token, if not, then we'll need to pass an error through
    const tempUser : UserInterface = await User.findOne({resetToken : resetToken, resetTokenExpiration : {$gt: Date.now()}});
    const hasUser = tempUser !== null;

    // Render the password reset page
    response.render(
        "auth/password-reset", 
        { 
            pageTitle : "Reset your password",
            csrfToken : csrfToken, 
            isAuthenticated : false,
            emailError : "",
            previousPasswordError : "",
            newPasswordError : "",
            hasUser : hasUser,
            resetToken : resetToken
        }
    );
};

// Render the new password form
const getNewPasswordForm = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get the CSRF token from the session, it's automatically defined before we perform any queries
    const csrfToken = request.session.csrfToken;

    // Get our request session from our Mongoose database and check if we're logged in
    const isLoggedIn = request.session.isLoggedIn;

    // Get the response message, we get this as a flash message which we only get once we've submitted a request
    const requestResponseMessage = request.flash("response");
    const userExists = request.flash("userExists");
    const isSubmitted = request.flash("isSubmitted");

    // Render the new password Form
    response.render("auth/new-password",{
        pageTitle : "Request a new password",
        csrfToken : csrfToken,
        isAuthenticated : isLoggedIn,
        requestResponseMessage : requestResponseMessage,
        userExists : userExists,
        isSubmitted : isSubmitted
    }); 
};

// Send the email which redirects to the password reset page
const postNewPasswordController =  async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // csrfToken from our session
    const sessionCSRFToken : string = request.session.csrfToken;
    const requestCSRFToken : string = String(request.body.csrfToken).replace(/\/$/, "");  

    // Get our inputs so we can verify and check them
    const emailAddress : string = request.body.emailInput;

    // Check if our csrf values are correct
    const isCSRFValid : boolean = sessionCSRFToken === requestCSRFToken;

    // CSRF protection
    if (isCSRFValid === true) {

        // See if we have a user in our database with the email address
        const tempUser = await User.findOne({email : emailAddress});
    
        // A reference to tell whether our form has been submitted or not
        request.flash("isSubmitted", "true");

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

            // Set the flash messages we're going to send back to the new-password view so the user can tell if they've successfully requested a password reset
            request.flash("userExists", "true");
            request.flash("response", "success");

            // Testing and debugging code
            const options = {
                to : [emailAddress],
                from: "nothile1@gmail.com",
                subject : "Password Reset",
                text : "Congratulations, you successfully signed up",
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
        }

        response.redirect("back");

    }else{

        response.status(403).send("CSRF protection failed!");
    }
};

// Handle the password reset functionality
const postPasswordResetPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // csrfToken from our session
    const sessionCSRFToken : string = request.session.csrfToken;
    const requestCSRFToken : string = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid : boolean = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        // We define these variables here as we need to scope them correctly as we validate the user
        let isPasswordValid : boolean = false;
        let passwordUpdated : boolean = false;
        
        // Get our inputs so we can verify and check them
        const emailAddress : string = request.body.emailInput;
        const previousPassword : string = request.body.previousPasswordInput;
        const newPassword : string = request.body.newPasswordInput;
        const confirmNewPassword : string = request.body.confirmNewPasswordInput;
        const passwordsMatch : boolean = newPassword === confirmNewPassword;

        // See if we have a user in our database with the email address
        const tempUser = await User.findOne({email : emailAddress, resetTokenExpiration : {$gt: Date.now()}});

        // Check if the password works
        if (tempUser !== null) {

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

        // Set our flash messages
        tempUser === null && request.flash("emailError", "Error : Email address not found in the database");
        isPasswordValid === false && request.flash("previousPasswordError", "Error : Previous password is wrong");
        passwordsMatch !== true && request.flash("newPasswordError", "Error : Passwords don't match");

        if (passwordUpdated === true) {

            // Redirect to the login page if we successfully reset our password
            response.redirect("login");

        }else{

            // Render the password reset page
            response.redirect("back");
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Post signup page controller, handles the signup form submission
const postSignupPageController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

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
                html : "<h1>Good job on your successful signup :)</h1>"
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

        }else{

            // Set the error message using a ternary operator based on if we already have a user with the same email or not
            const emailErrorMessage = tempUser === null ? "Error : Email address isn't valid" : "Error : Email address is already in use";

            // Set our flash messages
            let passwordError : string = "";
            !passwordsMatch && (passwordError = "Error : Passwords don't match");
            !isPasswordLengthValid && (passwordError = "Error : Both passwords must be at least 6 characters long");
        
            // Render the login page here
            // Note: Don't use a forward slash when defining URL's here
            response.render("auth/signup", { 
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
const postLoginAttemptController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // Get email address and password
    const email = request.body.emailInput;
    const password = request.body.passwordInput;

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
    // Check if our csrf values are correct
    const isCSRFValid = sessionCSRFToken === requestCSRFToken;

    if (isCSRFValid === true) {

        // Get our current User from the backend
        const user = await User.findOne({email : email.toLowerCase()});

        // Make sure that we have a user before we reference their properties
        if (user !== null) {

            // We define these variables here as we need to scope them correctly as we validate the user
            let isPasswordValid : boolean = false;
            let isEmailValid : boolean = false;
            let currentUser : SessionUser | undefined = undefined;

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
                response.redirect("products");

            } else {

                // Set the email and password error messages if they're available
                isEmailValid === false && request.flash("emailError", "Error : Email address isn't a valid format");
                isPasswordValid === false && request.flash("passwordError", "Error : Password isn't valid");

                // Reload the login page
                response.redirect('back');
            }

        }else{

            // Set the flash messages for our email address and password
            request.flash("emailError", "Error : User doesn't exist in the database");

            // Reload the login page
            response.redirect('back');
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Logout page controller
const postLogoutAttemptController = async (request : ExtendedRequest, response : Response, next : NextFunction) => {

    // csrfToken from our session
    const sessionCSRFToken = request.session.csrfToken;
    const requestCSRFToken = String(request.body.csrfToken).replace(/\/$/, "");
    
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
            
        }catch(error : unknown){

            console.clear();
            console.error("Error : Logout functionality failed, please contact the development team");

            // Go back to the page we were previously on
            response.redirect("back");
        }

    }else{
        
        response.status(403).send("CSRF protection failed!");
    }
};

// Export the controllers
export { getLoginPageController, postLoginAttemptController, postLogoutAttemptController, getSignupPageController, postSignupPageController, getPasswordResetPageController, postPasswordResetPageController, getNewPasswordForm, postNewPasswordController };
