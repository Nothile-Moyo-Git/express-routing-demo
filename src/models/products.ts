/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them
 * 
 * @property products : Product[]
 * @method addProduct : (product Product) => void
 */

import fs from "fs";
import path from "path";
import rootDir from "../util/path";

// Setting the interface for the Product objects
interface Product {
    title : string
}

class Products {

    // Products variable
    public products : Product[] = [];

    // Create an empty products array on class instantiation
    construtor(){
        this.products = [];
    };

    // Add a product to the produts array
    addProduct = (product : Product) => {
        
        // Add the new product to our array of products
        this.products.push(product);
    };

    // Save to the products json file
    saveProduct = (product : Product) => {

        // Create the path
        const p = path.join(
            rootDir, 
            "data",
            "products.json" 
        );

        // Save the file to the folder, and if it doesn't exist, create it!
        fs.appendFileSync(p, `${product.title} \r\n`);

        // Read our saved file
        fs.readFile(p, (err: NodeJS.ErrnoException, data: Buffer) => {

            let products : Product[];

            if (err) {

                console.log(err);
            }else{

                console.log("Outputting data buffer");
                products = JSON.parse(data);
            }

        });

    }

}

export default Products;