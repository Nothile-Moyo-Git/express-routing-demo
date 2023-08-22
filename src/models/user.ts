/**
 * User model
 * 
 * This file defines the model for Mongoose model "User"
 * For the purpose of this project, the user Generated here will be passed as a singleton throughout the project
 * The singleton will work as the "context" for this application
 * The methods are inherited from the default Mongoose model and the static methods we use come from that
 * 
 * With TypeScript, an interface must be defined for the Generic we pass through to our schema constructor
 * We do not define the model for Mongoose instances here, we merely define the schema and instantiate our model
 * 
 * Since we're now using the Mongoose ODM, we create the interface we pass through as our generic type
 * We're given many static methods for working with collections
 * Queries can be found here: https://mongoosejs.com/docs/queries.html
 */

// Imports
import mongoose from "mongoose";

// Create an interface representing a document in MongoDB
interface User {
    name : string,
    email : string
}

// Define our mongoose User schema
const userSchema = new mongoose.Schema<User>({
    name : { type : String, required : true },
    email : { type : String, required : true }
});

// Create our model for exporting
const User = mongoose.model("User", userSchema);

export default User;