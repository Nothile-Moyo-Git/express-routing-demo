// Imports, we're creating an express http server using development variables
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import adminRoutes from "../routes/admin";
import shopRoutes from "../routes/shop";
import errorRoutes from "../routes/error";

// Import the .env variables
dotenv.config();

// Be able to instantiate our express server
const app = express();

// Get our port number from our environment file
const port = process.env.DEV_PORT;

// Run the urlEncoded bodyParser to get the body of our objects
// This allows us to get request.body
app.use( bodyParser.urlencoded({ extended : true }) );

// Use our admin router which handles the product form and page
app.use( '/admin', adminRoutes );

// Use our shop router which handles the output for the home page
app.use( shopRoutes );

// Use the error page router
app.use( errorRoutes );

// Listen to the port
app.listen(port, () => {

    console.log(`[server]: Server is running on http://localhost:${port}`);
});