// Imports, we're creating an express http server using development variables
import path from "path";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import adminRoutes from "./routes/admin";
import shopRoutes from "./routes/shop";
import errorRoutes from "./routes/error";
import { sequelize } from "./util/database";
import { SequelizeProducts } from "./models/products";
import { Request, Response, NextFunction } from 'express';
import { User, UserModel } from "./models/user";
import SequelizeCart from "./models/cart";
import SequelizeCartItem from "./models/cart-item";
import SequelizeOrders from "./models/order";
import SequelizeOrderItems from "./models/order-item";

// Extend the request object in order to set variables in my request object
interface UserInterface {
    id : number,
    name : string,
    email : string
}

interface RequestWithUserRole extends Request{
    User ?: UserInterface
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
app.use(( request : any, response : Response, next : NextFunction ) => {

    // Get the dummy User
    const getUserOnLoad = async () => {

        // Get the user result data
        const userResult = await User.findAll({
            attributes : ["id", "name", "email"],
            where : { id : 1 }
        });

        // Set the user in the request object
        request.User = userResult;

        // Check if the cart exists
        const cartResult = await SequelizeCart.findAll({
            where : { userid : 1 }
        });

        // Output the cart result
        if (cartResult.length === 0){
            request.User[0].createCart();
        }

        // Execute the next middleware, call next in the async call so the next middleware executes
        next();
    };

    getUserOnLoad();
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
    // Creates a foreign key which is the userid found in the products table
    // Also creates a foreign 
    SequelizeProducts.belongsTo( User, { constraints : true, onDelete : 'CASCADE' });
    SequelizeCart.belongsTo( User );

    // User associate to many
    // Creates a join between the products and the cart
    User.hasMany( SequelizeProducts );
    User.hasOne( SequelizeCart );

    // Many to many relationship since one cart can have multiple items, but a product can also be in multiple carts
    // Since it's a many to many relationship through the cart item, the product and userid will now be in cart items
    SequelizeProducts.belongsToMany(SequelizeCart, { through : SequelizeCartItem });
    SequelizeCart.belongsToMany(SequelizeProducts, { through : SequelizeCartItem });

    // Since users can have multiple orders and each order belongs to a user
    // This is a one to many relationship
    SequelizeOrders.belongsTo(User);
    User.hasMany(SequelizeOrders);
    SequelizeOrders.belongsToMany(SequelizeProducts, {
        through: SequelizeOrderItems
    });

    // Sync all models to the database and instantiate them 
    // Use { force : true } if you want to rebuild the tables when you create the server
    await sequelize.sync();

    // Create new user using the create method     
    const classTestUser = await UserModel.findAll({ raw : true, where : { id : 1 } });

    // Check if a user exists, if not, create the user
    if ( classTestUser.length === 0 ) {

        await sequelize.models.usermodel.create({
            id : 1,
            name : "Nothile Moyo",
            email : "nothile1@gmail.com"
        });    
    }

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