/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 */

import { getDB } from "../data/connection";
import { ObjectId } from "mongodb";

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

    // Find the user by ID
    static async findById(id : string){

    }
};

export default User;