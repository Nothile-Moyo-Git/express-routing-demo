/**
 * Author : Nothile Moyo
 * Date Created : 14/01/2024
 * License : MIT
 * 
 * Websocket Controller handler page
 * This is the route handler for the chat and any websockets that we're going to run on the server
 * 
 * @method getWebsocketChatController : () => void | next
 */

// import our express types for TypeScript use
import { NextFunction, Response } from 'express';
import { ExtendedRequestInterface, UserInterface } from '../@types';

// Render the websocket page and create the form in order to test the webhook
const getChatPageController = (request : ExtendedRequestInterface, response : Response, next : NextFunction) => {

    // Check if the user is logged in so we determine which menu we want to show, if we don't do this we always show the logged in menu even if we're not
    const isLoggedIn = request.session.isLoggedIn;

    // Get our csrf token
    const csrfToken = request.session.csrfToken;

    // Render the websocket chat page
    response.render("pages/websockets/socket", {
        pageTitle : "Live chat",
        isAuthenticated : isLoggedIn === undefined ? false : true,
        csrfToken : csrfToken
    });
};

export { getChatPageController };