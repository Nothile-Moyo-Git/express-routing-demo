/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them in a list on a page
 * The Product can be instantiated and then it connects to our MongoDB server
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
interface Product {
    title : string,
    price : number,
    description : string,
    image : string
}

// Define our Mongoose product schema
const productSchema = new mongoose.Schema<Product>({
    title : { type : String, required : true },
    price : { type : Number, required : true },
    description : { type : String, required : true },
    image : { type : String, required : true }
});

// Create our model for exporting
const Product = mongoose.model('Product', productSchema);

export default Product;

