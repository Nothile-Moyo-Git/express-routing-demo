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
import bcrypt from "bcrypt";
import { CartItemInterface, UserInterface, ProductInterface, UserMethodsInterface } from "../@types";

// Setting the user type so we can define methods
type UserModel = Model<UserInterface, {}, UserMethodsInterface>;

// Define our mongoose User schema
// Mongoose automatically adds in _id to every table when working with schemas, so you must set it to false
const userSchema = new mongoose.Schema<UserInterface>({
    name : { type : String, required : [true, "Add a name to the User object you're sending to MongoDB"] },
    email : { 
        type : String, 
        lowercase : true,
        unique : true,
        required : [true, "Add an email address to the User object you're sending to MongoDB"] },
    password : { type : String, required : false },
    cart : {
        items : [{ 
            productId : mongoose.Schema.Types.ObjectId,
            title : String,
            quantity : Number,
            price : Number,
            image : String,
            description : String,
            _id : false
        }],
        totalPrice : { type : Number, required : true }
    },
    resetToken : {
        type : String,
        lowercase : true,
        required : false
    },
    resetTokenExpiration : {
        type : Date,
        required : false
    }
});

// Create the add to cart method for our user in Mongoose
userSchema.method('addToCart', function addToCart (product : ProductInterface) {

    // Get the index of the product in our cart items
    const cartProductIndex : number = this.cart.items.findIndex((childProduct : CartItemInterface) => {
        return childProduct.productId.toString() === product._id.toString();
    });

    // If we already have the cart item, update the quantity, otherwise, add it in
    // Note: We use a new object with a spread operator since we can't mutate the this.cart.items property from this model
    if (cartProductIndex >= 0) {

        // Increase the quantity
        this.cart.items[cartProductIndex].quantity += 1;

        // Update the totalPrice
        this.cart.totalPrice += this.cart.items[cartProductIndex].price;

    }else{

        // Add a new cart item
        this.cart.items.push({
            description : product.description,
            productId : product._id,
            title : product.title, 
            price : product.price,
            image : product.image,
            quantity : 1
        });

        // Update the totalPrice
        this.cart.totalPrice += product.price;
    }

    // Add the userId to the cart item
    this.cart.userId = this._id;

});

// Create the delete from cart method for our user in Mongoose
userSchema.method('deleteFromCart', function (productId : string) {

    // Filter out the cart and reduce the total price
    const filteredCartItems = this.cart.items.filter((item : CartItemInterface) => {

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

    // Update our current user in MongoDB
    this.save();
});

// Create the empty cart method for ouyr user in Mongoose
userSchema.method('emptyCart', function () {

    // Create an empty cart
    const emptyCart = {
        items : [],
        totalPrice : 0
    };

    // Update the cart on the user instance
    this.cart = emptyCart;
});

// Create a hash sync for a new user
userSchema.method('generateHash', function(password : string) {

    // Return a hash string
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
});

// Compare the passwords
userSchema.method('validatePassword', function(password : string) {

    // Return password validation check as a boolean
    // As compare the hashes here based on updating the password to ensure security
    return bcrypt.compareSync(password, this.password);
});

// Create our model for exporting
const User = mongoose.model<UserInterface, UserModel>("User", userSchema);

export default User;