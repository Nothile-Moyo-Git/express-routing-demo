// Imports, we're creating an express http server using development variables
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import adminRoutes from "./routes/admin";
import shopRoutes from "./routes/shop";
import errorRoutes from "./routes/error";
import { sequelize } from "./util/database";
import path from "path";
import { SequelizeProducts } from "./models/products";
import { Request, Response, NextFunction } from 'express';
import { User } from "./models/user";

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
app.use("*", ( request : Request, response : Response, next : NextFunction ) => {

    console.log("Get user on load");

    // Get the dummy User
    const getUserOnLoad = async () => {

        // Get the user result data
        const userResult = await User.findAll({
            raw : true,
            where : { id : 1 }
        });

        // Extend the Request type here

    };

    getUserOnLoad();
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

    // Create the one to many relations for the database
    SequelizeProducts.belongsTo( User, { constraints : true, onDelete : 'CASCADE' });

    // User associate to many
    User.hasMany( SequelizeProducts );

    // Sync all models to the database and instantiate them
    // Use { force : true } if you want to rebuild the tables when you create the server
    await sequelize.sync();

    // Check if a user exists, if not, create them
    const testUser = await User.findAll({ raw : true, where : { id : 1 } });

    // If test user doesn't exist (is empty), then create them
    if ( testUser.length === 0 ) {

        // Create a new user
        await User.create({
            id : 1,
            name : "Nothile Moyo",
            email : "nothile1@gmail.com",
        });
    }
    
    // Listen to the port
    app.listen(port, () => {
        console.log(`[server]: Server is running on http://localhost:${port}`);
    });
};

// Execute server start
startServer();
;