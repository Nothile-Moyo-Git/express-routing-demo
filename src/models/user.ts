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
import mongoose, { Model } from "mongoose";
import { ObjectId } from "mongodb";

// Product interface for the product we pass through to the add to cart method
interface Product {
    _id : ObjectId,
    title : string,
    price : number,
    description ?: string,
    image ?: string,
    userId ?: ObjectId
}

// Create an interface representing a document in MongoDB
interface CartItem{
    productId : ObjectId,
    title : string,
    quantity : number, 
    price : number
}
interface User {
    name : string,
    email : string
    cart : {
        totalPrice : number,
        items : CartItem[]
    }
}

// Adding the typing system for our methods in mongoose
interface UserMethods {
    addToCart : (product : Product) => void
    deleteFromCart : (productId : string) => void
}

// Setting the user type so we can define methods
type UserModel = Model<User, {}, UserMethods>;

// Define our mongoose User schema
// Mongoose automatically adds in _id to every table when working with schemas, so you must set it to false
const userSchema = new mongoose.Schema<User>({
    name : { type : String, required : true },
    email : { type : String, required : true },
    cart : {
        items : [{ 
            productId : mongoose.Schema.Types.ObjectId,
            title : String,
            quantity : Number,
            price : Number,
            _id : false
        }],
        totalPrice : { type : Number, required : true }
    }
});

// Create the add to cart method for our user in Mongoose
userSchema.method('addToCart', function addToCart (product : Product) {

    // Get the index of the product in our cart items
    const cartProductIndex : number = this.cart.items.findIndex((childProduct : CartItem) => {
        return childProduct.productId.toString() === product._id.toString();
    });

    // If we already have the cart item, update the quantity, otherwise, add it in
    // Note: We use a new object with a spread operator since we can't mutate the this.cart.items property from this model
    if (cartProductIndex >= 0) {

        // Increase the quantity
        const incrementedQuantity = this.cart.items[cartProductIndex].quantity + 1;
        this.cart.items[cartProductIndex].quantity = incrementedQuantity;

        // Update the totalPrice
        this.cart.totalPrice += this.cart.items[cartProductIndex].price;

    }else{

        // Add a new cart item
        this.cart.items.push({
            title : product.title, 
            productId : product._id,
            price : product.price,
            quantity : 1
        });

        // Update the totalPrice
        this.cart.totalPrice += product.price;
    }

});

// Create the delete from cart method for our user in Mongoose
userSchema.method('deleteFromCart', function (productId : string) {

    // Filter out the cart and reduce the total price
    const filteredCartItems = this.cart.items.filter((item : CartItem) => {

        // If the id's match, reduce the total price
        if (productId === item.productId.toString()) {

            // Reduce the totalPrice based on the price and number of items
            this.cart.totalPrice -= (item.price * item.quantity);
        }

        // Only return array values which aren't indexed with the ID we passed through as a parameter
        return productId !== item.productId.toString();
    });

    // Mutate the cart object with the new one we've created
    this.cart.items = filteredCartItems;  
});

// Create our model for exporting
const User = mongoose.model<User, UserModel>("User", userSchema);

export default User;