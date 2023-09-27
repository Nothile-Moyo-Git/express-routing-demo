// Import express router for the admin and shop pages
// This file is for the output routes
// This is the authentication router, first it creates an instance of express router model
// It handles routes by executing functions passed through from the auth controller
// Note: Please use the same name for your controller
import express from "express";

// Get the controller so we can handle all of our requests
import { getLoginPageController, postLoginAttemptController, postLogoutAttemptController, getSignupPageController, postSignupPageController, getPasswordResetPageController, postPasswordResetPageController, getNewPasswordForm, postNewPasswordController } from "../controllers/auth";

// Define the object for our router which we pass through to the index file
const authRoutes = express.Router();

// Render the login page form
authRoutes.get("/login", getLoginPageController);

// Submit the login page
authRoutes.post("/login", postLoginAttemptController);

// Logout the current user
authRoutes.post("/logout", postLogoutAttemptController);

// Render the signup page
authRoutes.get("/signup", getSignupPageController)

// Handle the sign up request
authRoutes.post("/signup", postSignupPageController);

// Render the new password form
authRoutes.get("/new-password", getNewPasswordForm);

// Handle the new password request
authRoutes.post("/new-password", postNewPasswordController);

// Render the password reset form
authRoutes.get("/reset/:resetToken", getPasswordResetPageController);

// Handle the password reset request
authRoutes.post("/reset", postPasswordResetPageController);

export default authRoutes;