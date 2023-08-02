/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them in a list on a page
 */

import { getDB } from "../data/connection";
import { ObjectId } from "mongodb";

class Product {

    protected title : string;
    protected price : number;
    protected description : string;
    protected imageUrl : string;
    protected id : string;

    // Instantiate the product when it's saved
    constructor(title : string, price : number, description : string, imageUrl : string){
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
    }

    // Store the item in the database
    async save(){

        // Get database information
        const db = await getDB();

        // Start the collection
        const collection = db.collection("products");

        // Insert a new product
        await collection.insertOne({
            title : this.title, 
            price : this.price,
            description : this.description,
            image : this.imageUrl
        });
    }

    // Get the items from the collection 
    static async getAll(){

        // Get database information
        const db = await getDB();

        // Start the collection object
        const collection = db.collection("products");

        // Create a cursor object for the products
        const productsCursor = collection.find({});

        // Convert the cursor to an array and return it
        const productsArray = await productsCursor.toArray();

        return productsArray;
    }

    //
    static async findById(id : string){
        
        // Get the database
        const db = await getDB();

        // Get the collection
        const collection = db.collection("products");

        // Create a new object id for searching cursors in the database
        const objectId = new ObjectId(id);

        // Get the cursor and product response
        const query = { _id : objectId };

        // Get the individual document
        const product = await collection.findOne(query);

        return product;
    }

    async updateById(id : string){

        // Get the database
        const db = await getDB();

        // Get the collection
        const collection = db.collection("products");

        // Create a new object id for cursors
        const objectId = new ObjectId(id);

        // Update the product and check the response
        await collection.updateOne(
            { "_id" : objectId },
            { $set : {
                title : this.title,
                image : this.imageUrl,
                description : this.description,
                price : this.price
            }}
        );
    }


    static async deleteById(id : string){

        // Get the database
        const db = await getDB();

        // Get the collection
        const collection = db.collection("products");

        // Create a new object id
        const objectId = new ObjectId(id);

        await collection.deleteOne({ "_id" : objectId});
    }
}

export default Product;

