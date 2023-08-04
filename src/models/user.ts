/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 * When checking if we have users or when querying them, we extend the WithId<Document> interface so we can work with the cursor Id's
 * 
 * 
 */

import { getDB } from "../data/connection";
import { Document, WithId } from "mongodb";

// We use a regular interface here so we don't have to deal with errors exporting our inherited interface
interface UserInterface{
    name : string,
    email : string
}

// Mongo user interface
interface MongoUserInterface extends WithId<Document>{
    name : string,
    email : string
}

// Prototype of the User class
class User {

    protected name : string;
    protected email : string;

    // Instantiate our user to be saved to the database
    constructor(name : string, email : string){
        this.name = name;
        this.email = email;
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
            email : this.email
        });
    }

    // Check if the user exists in the database
    static async checkIfRootExists(){

        // Use my current ID as I'm building the app
        // const idString = "64cbf9c421ce8d8b4ac8b66f";
        // const _id = new ObjectId(idString);

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("users");

        // Check if the user exists
        const cursor = collection.find({});

        // Array of users
        const cursorArray = await cursor.toArray();

        // We format the array so that it works with TypeScript and avoids the WithId<Document> error
        const users = cursorArray.map((item : MongoUserInterface) => {

            return {
                _id: new Object(item._id),
                name : item.name,
                email : item.email
            }
        });

        return users;
    }

    // Find the user by ID
    static async findById(id : string){

    }
};

export { UserInterface };
export default User;