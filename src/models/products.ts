/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them in a list on a page
 *
 */

import { getDB } from "../data/connection";

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
        const db = getDB();

        // Start the collection
        const collection = db.collection("products");
    }

    static async getAll(){

        // Get database information
        const db = getDB();

        // Start the collection object
        const collection = db.collection("products");

        // Create a cursor object for the products
        const productsCursor = collection.find({});

        // Convert the cursor to an array and return it
        const productsArray = await productsCursor.toArray();

        return productsArray;
    }
}

export default Product;

