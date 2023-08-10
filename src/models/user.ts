/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 * When checking if we have users or when querying them, we extend the WithId<Document> interface so we can work with the cursor Id's
 * Since the cart has a 1 to 1 relation 
 * 
 * @method save : async() => void
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
    async save(){

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

    // Add a product to the cart
    async addToCart(product : WithId<Document>, userId : ObjectId){

        // Instantiate our total price variable
        let totalPrice : number = 0;

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
                    price : product.price
                }],
                totalPrice : product.price
            }
        }

        // If our cart isn't empty, add the new product to it
        

        // If we have other items on the cart, then we add a new product
        console.log( "\n\n" );
        console.log( "Cart" );
        console.log( this.cart );
        console.log( "Item Index" );
        console.log( itemIndex );




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
    static async getUsers(){

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("users");

        // Check if the user exists
        const cursor = collection.find({});

        // Array of users
        const cursorArray = await cursor.toArray();

        // We format the array so that it works with TypeScript and avoids the WithId<Document> error
        const users = cursorArray.map((item: WithId<Document>) => {

            return {
                _id: new Object(item._id),
                name : item.name,
                email : item.email
            }
        });

        return users;
    }

    // Get users from the database
    static async getRootUser(){

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
    async createIfRootIsNull(){

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
    static async findById(id : string){

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
};

export default User;