/**
 * The index file. This serves as our "main" method
 * This file imports all of the TS files that we compile into ES5
 * We start our server and create our connection pool here
 * 
 * @method startServer : async () => void
 */


// Imports, we're creating an express http server using development variables
import path from "path";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import adminRoutes from "./routes/admin";
import shopRoutes from "./routes/shop";
import errorRoutes from "./routes/error";
import mongoConnect from "./data/connection";
import { Response, NextFunction } from 'express';
import User from "./models/user";

// Import the .env variables
dotenv.config();

// Be able to instantiate our express server
const app = express();

// Get our port number from our environment file
const port = process.env.DEV_PORT;

// Run the urlEncoded bodyParser to get the body of our objects
// This allows us to get request.body
app.use( bodyParser.urlencoded({ extended : true }) );

// Serve the css files statically
app.use( express.static( path.join( __dirname, "/css" ) ));

// Serve our image files statically
app.use( express.static( path.join( __dirname, "/images" ) ));

// Set the type of view engine we want to use
// We can use pug or EJS since it's supported out of the box
// Register a templating engine even case it's not default, we do this with handlebars
// By using engine here, it allows express-handlebars to use its default layout which must be named "main.handlebars"
// app.engine('handlebars', engine());
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Create our middleware
// Middleware refers to software or "code" that allows a connection and interaction with a database
// Executes on every request
app.use( async( request : any, response : Response, next : NextFunction ) => {

    // Check if my initial user exists
    const user = await User.getRootUser();
    
    let requestUser = {};

    if (user === null) {

        // Create user if they're null
        const userInstance = new User( "Nothile", "nothile1@gmail.com", {items : [], totalPrice : 0});
        requestUser = await userInstance.createIfRootIsNull();
    } else{
        requestUser = user;
    }

    // Add the user details to the request here
    request.User = requestUser

    console.clear();
    console.log(`[server]: Server is running on http://localhost:${port}`);
    console.log("\n");
    console.log("User");
    console.log(requestUser);

    next();
});

// Use our admin router which handles the product form and page
app.use( '/admin', adminRoutes );

// Use our shop router which handles the output for the home page
app.use( shopRoutes );

// Use the error page router
app.use( errorRoutes );

// Start our server async
const startServer = async () => {
    
    mongoConnect(() => {

        // Listen to the port
        app.listen(port);
    });
};

// Execute server start
startServer();