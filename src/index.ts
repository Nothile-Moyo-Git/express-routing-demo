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
import User from "./models/user";
import errorRoutes from "./routes/error";
import { createMongooseConnection } from "./data/connection";
import { Response, NextFunction } from 'express';
import { ObjectId } from "mongodb";

// Set the interface for the current user
interface UserInterface {
    name : string,
    email : string,
    _id : ObjectId
}

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

    // Check if we have any users
    const userCount = await User.countDocuments();

    // If we have no users, let's create my user for the singleton that's passed through to the app
    if (userCount === 0) {

        // Create my user
        const nothile = new User({
            name : "Nothile",
            email : "nothile1@gmail.com",
            cart : {
                items : [],
                totalPrice : 0
            }
        });

        // Save my user to the database
        nothile.save();
    }

    // Query my current user
    const nothile : UserInterface | null = await User.findById(new ObjectId("64e66c380590b734eb8459ed"));

    // UserId
    const userDetails = new Object({
        name : nothile?.name,
        email : nothile?.email,
        _id : nothile?._id
    });

    // Pass the singleton through to the app
    request.User = userDetails;

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
            console.log(`[Server]: Server is running on http://localhost:${port}`);
        });
    });
};

startServer();
