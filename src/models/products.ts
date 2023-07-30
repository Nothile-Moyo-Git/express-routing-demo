/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them in a list on a page
 *
 */

import { getDB } from "../data/connection";
import { ObjectId } from "mongodb";

// Product interface for our dynamic schema
interface ProductInterface {
    title : string,
    price : number,
    description : string,
    image : string
}

class Product {

    protected title : string;
    protected price : number;
    protected description : string;
    protected imageUrl : string;

    // Instantiate the product when it's saved
    constructor(title : string, price : number, description : string, imageUrl : string){
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
    }

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

    static async getProduct(id : string){
        
        // Get the database
        const db = await getDB();

        // Get the collection
        const collection = db.collection("products");

        const objectId = new ObjectId(id);

        // Get the cursor and product response
        const query = { _id : objectId };

        // Get the individual document
        const product = await collection.findOne(query);

        return product;
    }
}

export default Product;

