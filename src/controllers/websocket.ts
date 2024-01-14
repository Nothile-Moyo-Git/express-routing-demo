/**
 * Author : Nothile Moyo
 * Date Created : 14/01/2024
 * License : MIT
 * 
 * Websocket Controller handler page
 * This is the route handler for the chat and any websockets that we're going to run on the server
 */

// import our express types for TypeScript use
import { NextFunction, Response } from 'express';
import { ExtendedRequestInterface, UserInterface } from '../@types';