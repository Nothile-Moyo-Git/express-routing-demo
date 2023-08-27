/**
 * Order model
 * 
 * This file defines the model for the Mongoose model "Order"
 * The order will have a userId which can be extracted from the User object in the body of the request
 * The orders can be queried and will be rendered on the page in a list using the "views/shop/orders.ejs" template
 * This will be used on the Shop controller when an order is created from buying the items in the Cart
 * 
 * With TypeScript, an interface must be defined for the Generic we pass through to our schema constructor
 * We do not define the model for Mongoose instances here, we merely define the schema and instantiate our model
 * 
 * Since we're now using the Mongoose ODM, we create the interface we pass through as our generic type
 * We're given many static methods for working with collections
 * Queries can be found here: https://mongoosejs.com/docs/queries.html
 */

import mongoose, { Model } from "mongoose";
import { ObjectId } from "mongodb";

// Defining our interfaces and our type in order to use TypeScript with Mongoose
interface OrderItem {
    title : string,
    price : number,
    quantity : number
}

interface Order {
    totalPrice : number,
    orderItems : OrderItem[],
    createdAt : Date,
    updatedAt : Date,
    user : {
        _id : ObjectId,
        name : string
    }
}

// Define our interfaces for our methods which we use to extend our mongoose model
interface OrderMethods {

}

// Setting the order type so we can define methods
// This is an extension of the Model generic type
type OrderModel = Model<Order, {}, OrderMethods>;

// Define our mongoose Order schema
// Mongoose automatically adds in _id to every table when working with schemas, so you must set it to false
const orderSchema = new mongoose.Schema<Order>({
    totalPrice : { type : Number, required : [true, "Please enter a total price"] },
    orderItems : [{
       title : { type : String },
       price : { type : Number },
       quantity : { type : Number },
       _id : false
    }],
    user : { 
        _id : { type : mongoose.Schema.Types.ObjectId, ref : 'User', required : [true, "Please reload the app to ensure that a root user is configured"]},
        name : { type : String }
    }
}, { timestamps : true });

// Create Mongoose model for our ODM
const Order = mongoose.model<Order, OrderModel>("Order", orderSchema);

export default Order;