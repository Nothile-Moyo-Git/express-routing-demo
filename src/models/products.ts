/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them
 * 
 * @property products : Product[]
 * @method addProduct : (product : Product) => void
 * @method saveProduct : (product : Product) => void
 * @method getProducts : () => void
 */

import fs from "fs";
import path from "path";
import rootDir from "../util/path";

// Setting the interface for the Product objects
interface Product {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string
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

        // Create the path to our file
        const p = path.join(
            rootDir, 
            "data",
            "products.json" 
        );

        // Read our saved file, we read it first to find the previous JSON and append to it
        fs.readFile(p, (err: NodeJS.ErrnoException, data: any) => {

            // Array of products we get from the file
            let products : Product[] = [];

            // If we fail at reading our file, create a new one
            if (err) {

                console.log( err );
            }else{

                // If our buffer isn't empty, add it to the products so we can amend our JSON
                if (data.length !== 0) {

                    // Parse the products into an array we can iterate
                    const productsArray = JSON.parse( data );

                    // Push each product into the products array so we can save that to the file
                    productsArray.map(( product : Product ) => {

                        products.push( product );
                    });

                }

                // Outputting the products array
                console.log( "JSON Products" );
                console.log( products );

                // Add the new product to the array
                products.push( product );

                // Stringify our JSON so we can save it to the appropriate file
                const json = JSON.stringify(products, null, "\t");

                // Save the file to the folder, and if it doesn't exist, create it!
                fs.writeFileSync(p, json, "utf-8");
            }

        });

    }

    // Get products
    getProducts = () => {

        // Create the path to our file
        const p = path.join(
            rootDir, 
            "data",
            "products.json" 
        );

        const products : Product[] = [];

        // Get the result synchronously
        const productsList : Product[] = JSON.parse(fs.readFileSync(p, "utf-8"));

        productsList.map((product : Product) => {
            products.push(product);
        });

        return products;
    };

    updateProduct = (title : string, image : string, description : string, price : number, id : string) => {

        // Get the current products
        const result = this.getProducts();

        console.clear();

        // Create our new array of products will replace the old one with and eventually save it
        const newProducts : Product[] = result.map((product : Product, index : number) => {

            console.log(`Index at position ${index}`);
            console.log("Product is currently");
            console.log(product);

            if (product.id === id) {
                return {
                    title : title,
                    image : image,
                    description : description,
                    price : price, 
                    id : id
                };
            }

            return product;
        });

        console.log("New Products");
        console.log(newProducts);

    };
}

export default Products;