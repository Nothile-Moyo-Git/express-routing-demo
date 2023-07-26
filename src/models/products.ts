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

        const db = getDB();

        const collection = db.collection("products");

        const productsCursor = await collection.find({});
    }
}

