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
    name : string,
    quantity : number
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
    addToCart : (product : Product) => CartItem[]
}

// Setting the user type so we can define methods
type UserModel = Model<User, {}, UserMethods>;

// Define our mongoose User schema
const userSchema = new mongoose.Schema<User>({
    name : { type : String, required : true },
    email : { type : String, required : true },
    cart : {
        items : [{ productId : mongoose.Schema.Types.ObjectId }, ],
        totalPrice : { type : String, required : true }
    }
});

// Create the add to cart method for our user in Mongoose
userSchema.method('addToCart', function addToCart (product : Product) {

    // We do this because we need an array we can mutate
    const cartItems = this.cart.items.map((item: any) => ({ ...item }));

    // Get the index of the product in our cart items
    const cartProductIndex : number = this.cart.items.findIndex((childProduct : CartItem) => {
        return childProduct.productId === product._id
    });

    // If we already have the cart item, update the quantity, otherwise, add it in
    // Note: We use a new object with a spread operator since we can't mutate the this.cart.items property from this model
    if (cartProductIndex >= 0) {

        const incrementedQuantity = this.cart.items[cartProductIndex].quantity + 1;
        cartItems[cartProductIndex].quantity = incrementedQuantity;

    }else{

        cartItems.push({
            title : product.title,
            productId : product._id,
            price : product.price
        })
    }

    // Deep copy the cart object and set the new cartItems array
    const updatedCart = {
        ...this.cart,
        items : cartItems
    };

    // Set the cart to the same as the cartItems array we defined and mutated previously
    this.cart = updatedCart;

    return updatedCart;

});

// Create our model for exporting
const User = mongoose.model<User, UserModel>("User", userSchema);

export default User;