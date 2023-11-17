/**
 * The index file. This serves as our "main" method
 * This file imports all of the TS files that we compile into ES5
 * We start our server and create our connection pool here
 * We also create a root user if one doesn't exist, and we pass the instance through so we can call the methods on any request
 * This index file currently uses both MongoDB and Mongoose. We use Mongoose as our ODM (Object Document Mapper). An ODM works very similarly to an ORM
 * 
 * @method startServer : async () => void
 * @method generateCSRFToken : () => number
 */

// Imports, we're creating an express http server using development variables
import path from "path";
import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin";
import shopRoutes from "./routes/shop";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import User from "./models/user";
import errorRoutes from "./routes/error";
import { createMongooseConnection, sessionUrl } from "./data/connection";
import { Request, Response, NextFunction } from 'express';
import { ObjectId } from "mongodb";
import session from "express-session";
import MongoStore from "connect-mongo";
import { password } from "./data/connection";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import { CustomError } from "./@types";
import multer from "multer";
import { getFileNamePrefixWithDate, getFolderPathFromDate } from "./util/utility-methods";
import fs from "fs";

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

// Extending the functionality of our express framework
// We define our views, our bodyparser so we can get the request.body from request (forms)
// We define our static routes for css files and images
// We define our cookie parser so we can work with our cookies and read them
// Finally, we use flash so we can temporarily pass values from one request to another(such as a failed login)

// Set the type of view engine we want to use
// We can use pug or EJS since it's supported out of the box
// Register a templating engine even it's not the default, we do this with ejs
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Run the urlEncoded bodyParser to get the body of our objects
// This allows us to get request.body
// Note, this doesn't work with images, you'll need multer in order to deal with file uploads since it can't urlencode images to text
// app.use( bodyParser.urlencoded({ extended : true }) );

// Set up options for disk storage, we do this because we store the files as a hashcode and a manual extention needs to be added
const fileStorage = multer.diskStorage({
    destination : (request : Request, file : Express.Multer.File, callback : (error: Error | null, destination: string) => void) => {

        // Set the folder path
        const folderPath = `uploads/${ getFolderPathFromDate() }`;

        // Check if our folder path already exists
        const folderExists = fs.existsSync(folderPath);

        // Create our folder path if it doesn't exist
        if (folderExists === false) {
            fs.mkdirSync(folderPath, {recursive : true});
        }

        callback(null, folderPath);
    },
    filename : (request : Request, file : Express.Multer.File, callback : (error: Error | null, destination: string) => void) => {
        
        // Set the filepath with the name
        const fileName = getFileNamePrefixWithDate() + '_' + file.originalname;

        callback(null, fileName);
    }
});


// Only store image files
const fileFilter = (request : Request, file : Express.Multer.File, callback : multer.FileFilterCallback ) => {
    
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        callback(null, true);
    }else{
        callback(null, false);
    }
}; 



// In order to handle file uploads, we must instantly call our multer method
// The trailing method defines how many files we expect to upload, in this case its one
// We then need to name the name of the field we're going to upload files from, in this case, it's image
app.use(multer({storage : fileStorage, fileFilter : fileFilter }).single("image"));

// Serve the css files statically
app.use( express.static( path.join( __dirname, "/css" ) ));

// Serve our image files statically
app.use( express.static( path.join( __dirname, "/images" ) ));

// Enable cookie parsing middleware
app.use( cookieParser() );

// Allow flash messages to be used.
app.use( flash() );

// Here we create a session, but unlike before, we store it on the server side.
// We instead store a secret key that's passed through to the backend
// It cannot be guessed, but our session data is also usable whenever we run our applications since we don't store it in memory
// The options also end sessions after 2 weeks, and check this and run the end innately in MongoDB
app.use(

    session({
        // Set our secret which is turned into a hashkey
        secret : "Adeptus",
        resave : false,
        saveUninitialized : false,
        name : "Adeptus",
        
        // Store on the server instead of memory
        store : MongoStore.create({
            mongoUrl : sessionUrl,
            dbName : "shop",
            // Note : set a collection name you're not already using, in this case, we use "sessions"
            collectionName : "sessions",
            autoRemove : "native",
            autoRemoveInterval : 10
        })     
    })
); 

// Generate a random CSRF token without using a deprecated package
const generateCSRFToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Create our middleware
// Middleware refers to software or "code" that allows a connection and interaction with a database
// Executes on every request
app.use( async( request : any, response : Response, next : NextFunction ) => {

    // Create a new CSRF token and save it on the server session
    if (!request.session.csrfToken) {
        request.session.csrfToken = generateCSRFToken();
    }

    // Check if we have any users
    const userCount = await User.countDocuments();

    // If we have no users, let's create my user for the singleton that's passed through to the app
    if (userCount === 0) {

        // Hash our password
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

        // Create my user
        const nothile = new User({
            name : "Nothile",
            email : "nothile1@gmail.com",
            cart : {
                items : [],
                totalPrice : 0
            },
            password : hashedPassword
        });

        // Save my user to the database
        nothile.save();
    }

    // Query my current user
    const nothile : UserInterface | null = await User.findOne({ name : "Nothile" });

    // Pass the singleton through to the app
    request.User = nothile;

    next();
});

// Use our admin router which handles the admin pages, which allow us to create, delete, or edit products
app.use( adminRoutes );

// Use our shop router which handles the output for the home and product pages
app.use( shopRoutes );

// Use the auth router which handles the login page
app.use( authRoutes );

// Use our user router which handles anything related to users or profile-based functionality
app.use( userRoutes );

// Use the error page router
// Place the error router last as it will override all of your other routes after it
app.use( errorRoutes );

// Hooking up the 500 error
// Express will automatically be able to detect that this is an error middleware 
app.use((error : CustomError, request : Request, response : Response, next : NextFunction) => {
    response.redirect("/500");
});

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
