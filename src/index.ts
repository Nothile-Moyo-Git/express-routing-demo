/**
 * The index file. This serves as our "main" method
 * This file imports all of the TS files that we compile into ES5
 * We start our server and create our connection pool here
 * We also create a root user if one doesn't exist, and we pass the instance through so we can call the methods on any request
 * This index file currently uses both MongoDB and Mongoose. We use Mongoose as our ODM (Object Document Mapper). An ODM works very similarly to an ORM
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
import { createMongooseConnection } from "./data/connection";
import { Response, NextFunction } from 'express';
import User from "./models/user";
import { ObjectId } from "mongodb";

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
    
    let userId = new ObjectId(0);
    let requestUser = {};

    if (user === null) {

        // Instantiate a user so we have a reference of them
        const userInstance = new User( "Nothile", "nothile1@gmail.com", { items : [], totalPrice : 0 });
        
        // Create a new user with the details provided, we also use an object ID for the root user in the User model
        await userInstance.createIfRootIsNull();

        // Get the user ID
        userId = new ObjectId("64cbf9c421ce8d8b4ac8b66f");

        // Set our request user so we stay within block scope
        requestUser = userInstance;

    } else{

        // Create new instance of user so we can access the methods in our middleware restful handlers
        const userInstance = new User(user.name, user.email, user.cart ? user.cart : { 
            items : [], 
            totalPrice : 0
        });

        // Set the user id for queries we want to output
        userId = user._id;

        // Set the request user 
        requestUser = userInstance;
    }

    // Add the user details to the request here
    request.User = requestUser
    request.UserId = userId;

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

    // Create a Mongoose connection
    await createMongooseConnection(() => {

        // Listen to the port
        app.listen(port, () => {
            console.log(`[server]: Server is running on http://localhost:${port}`);
        });
    });
};

// Execute server start
startServer();