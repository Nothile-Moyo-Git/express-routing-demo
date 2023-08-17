/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 * When checking if we have users or when querying them, we extend the WithId<Document> interface so we can work with the cursor Id's
 * Since the cart has a 1 to 1 relation 
 * 
 * @method save : async() => void
 * @method updateTotalPrice : () => void
 * @method getUsers : static async() => []
 * @method getRootUser : static async () => {user}
 * @method createIfRootIsNull : async () => {user}
 * @method findById : static async () => {user}
 */

import { getDB } from "../data/connection";
import { Document, ObjectId, WithId } from "mongodb";

interface CartItem {
    productId : ObjectId,
    quantity : number,
    title : string,
    price : number
}

// Since we're using the 1 to 1 relation, we actually store the cart on the user and not its own collection, so we need an interface here
interface Cart {
    items : CartItem[],
    totalPrice : number
}

class User {

    protected name : string;
    protected email : string;
    protected cart : Cart;

    // Instantiate our user to be saved to the database
    constructor(name : string, email : string, cart : Cart){
        this.name = name;
        this.email = email;
        this.cart = cart;
    }

    // Save our newly created user to the users collection
    public async save(){

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("users");

        // Create a new user
        await collection.insertOne({
            name : this.name,
            email : this.email,
            cart : { 
                items : [], 
                totalPrice : 0
            }
        });
    }

    private updateTotalPrice(){

        let totalPrice = 0;

         // Calculate the total price based on each 
        this.cart.items.forEach((item : CartItem) => {
            totalPrice += (item.price * item.quantity);
        });

        // Set the new totalPrice
        this.cart.totalPrice = totalPrice;
    }

    // Add a product to the cart
    public async addToCart(product : WithId<Document>, userId : ObjectId){

        // Nullish coalescing operator
        this.cart.items = this.cart.items || [];

        // Cart product
        const itemIndex = this.cart.items.findIndex((item : CartItem) => {
            return item.productId.toString() === product._id.toString();
        }); 

        // Check if cart is empty
        const isCartEmpty = this.cart.items.length === 0;

        // If we don't have the product on out Cart, let's create it
        if (itemIndex < 0 && isCartEmpty) {

            // Create a new cart with the single product information inside it
            this.cart = {
                items: [{
                    productId : product._id, 
                    quantity : 1,
                    title : product.title,
                    price : product.price
                }],
                totalPrice : product.price
            }
        }

        // If we have the product, add one to the quantity of it
        if (itemIndex >= 0) {

            // Increment quantity
            this.cart.items[itemIndex].quantity++;

            // Update the total price
            this.updateTotalPrice();
        }

        // If our cart isn't empty, add the new product to it
        if (itemIndex < 0 && !isCartEmpty) {

            // Add the new product to the cart
            this.cart.items.push({
                productId : product._id,
                quantity : 1,
                price : product.price,
                title : product.title
            });

            this.updateTotalPrice();
        }

        // Get database connection
        const db = await getDB();

        // Reference our user collection
        const collection = db.collection("users");

        // Update the user with the new cart     
        await collection.updateOne(
            { "_id" : userId },
            { $set : { cart : this.cart } }
        );
    }

    // Check if the user exists in the database
    public static async getUsers(){

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("users");

        // Check if the user exists
        const cursor = collection.find({});

        // Array of users
        const cursorArray = await cursor.toArray();

        // We format the array so that it works with TypeScript and avoids the WithId<Document> error
        const users = cursorArray.map((item : WithId<Document>) => {

            return {
                _id: new Object(item._id),
                name : item.name,
                email : item.email
            }
        });

        return users;
    }

    // Get users from the database
    public static async getRootUser(){

        // Set the object ID
        const idString = "64cbf9c421ce8d8b4ac8b66f";
        const id = new ObjectId(idString); 

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("users");

        // Create our query
        const query = { _id : id };

        // Get the user
        const user = await collection.findOne(query);

        // Return user details
        return user;
    }

    // Create a new root user if it doesn't exist for me
    public async createIfRootIsNull(){

        // Id
        const idString = "64cbf9c421ce8d8b4ac8b66f";
        const id = new ObjectId(idString); 

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("users");
        
        // Create our query
        const user = { 
            _id : id,
            name : this.name,
            email : this.email
        };

        // Create a new user
        await collection.insertOne(user);
    }

    // Find the user by ID
    public static async findById(id : string){

        // Create an object ID
        const _id = new ObjectId(id);

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("users");

        // Query of the string
        const query = { _id : _id };

        // Get user from the backend based on the Object id
        const response = await collection.findOne(query);

        // Return the user object
        return response;
    }

    // 
    public async deleteFromCart(id : string, userId : ObjectId){

        // Get database information
        const db = await getDB();

        // Cart product
        const itemIndex = this.cart.items.findIndex((item : CartItem) => {
            return item.productId.toString() === id;
        }); 

        // Create new array that we're going to mutate
        const newCart = this.cart;

        // Create a new array that removes the previous one based on the index
        newCart.items.splice(itemIndex, 1);

        // Query our collection
        const collection = db.collection("users");

        this.updateTotalPrice();

        // Update the user with the new cart  
        await collection.updateOne(
            { "_id" : userId },
            { $set : { cart : newCart } }
        );
    }

    public async addOrder(userId : ObjectId){

        // Get database information
        const db = await getDB();

        // Start the collection, if it doesn't exist, create it
        const collection = db.collection("orders");

        // Create a new date based on our current date
        const date = new Date();
        const text = date.toLocaleString();

        // Create a new order object
        const newOrder = Object.create(null);

        // Assign properties to our object
        newOrder.items = [...this.cart.items];
        newOrder.totalPrice = this.cart.totalPrice;
        newOrder.datePurchased = text;
        newOrder.userId = userId;
 
        // Create our order in our orders collection
        await collection.insertOne(newOrder);

        // Start the collection, if it doesn't exist, create it
        const users = db.collection("users");

        // Empty out our cart
        this.cart = { items : [], totalPrice : 0 };

        // Update the user with the new cart  
        await users.updateOne(
            { "_id" : userId },
            { $set : { cart : this.cart } }
        );
    }

    public static async getOrders(userId : ObjectId){

        // Get database information
        const db = await getDB();

        // Start the collection, if it doesn't exist, create it
        const collection = db.collection("orders");

        // We want to get the orders for the current user
        const query = { userId : userId };

        // Get the collection of orders
        const response = collection.find(query);

        // Convert the orders cursor to an array
        const orders = await response.toArray();

        // Return orders
        return orders;
    }
};

export default User;