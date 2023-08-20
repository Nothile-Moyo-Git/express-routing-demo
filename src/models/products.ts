/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them in a list on a page
 * The Product can be instantiated and then it connects to our MongoDB server
 * The constructor is used in order to create a new Product we can store in our colletion
 * 
 * The static methods are for CRUD functionality
 * 
 * @method save : async () => void
 * @method getAll : static async () => [product]
 * @method findById : static async () => {product}
 * @method updateById : async () => void
 * @method deleteById : async () => void 
 */

// Imports
import mongoose from "mongoose";

// Define our Mongoose product schema
const productSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    }
});

// Create our model for exporting
const Product = mongoose.model('Product', productSchema);

export default Product;

