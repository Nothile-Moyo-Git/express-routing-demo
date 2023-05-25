/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them
 * 
 * @property products : Product[]
 * @method addProduct : (product : Product) => void
 * @method saveProduct : (product : Product) => void
 * @method getProducts : () => void
 * @method updateProduct : (title : string, image : string, description : string, price : number, id : string) => void
 * @method getProductById : (id : string) => void
 */

import fs from "fs";
import path from "path";
import rootDir from "../util/path";
import db from "../util/database";

const tableName = "products";

// Setting the interface for the Product objects
interface Product {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string
};

interface SQLProduct {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string,
    productid : string
};

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

                // Add the new product to the array
                products.push({
                    title : product.title,
                    image : product.image,
                    description : product.description,
                    price : Number(product.price),
                    id : product.id
                });

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

    // Fetch all products from the database
    fetchAll = () => {

        return db.execute("SELECT * FROM products");
    };

    // Update a single product in the JSON
    updateProduct = (title : string, image : string, description : string, price : number, id : string) => {

        // Get the current products
        const result = this.getProducts();

        console.clear();

        // Create our new array of products will replace the old one with and eventually save it
        const newProducts : Product[] = result.map((product : Product) => {

            // If the ID's the same, create our new array of
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

        // Create the path to our file
        const p = path.join(
            rootDir, 
            "data",
            "products.json" 
        );

        // Read our saved file, we read it first to find the previous JSON and append to it
        fs.readFile(p, (err: NodeJS.ErrnoException) => {

            // If we fail at reading our file, create a new one
            if (err) {

                console.log( err );
            }else{

                // Stringify our JSON so we can save it to the appropriate file
                const json = JSON.stringify(newProducts, null, "\t");

                // Save the file to the folder, and if it doesn't exist, create it!
                // fs.writeFileSync(p, json, "utf-8");
            }
        });

        // Update product async
        const updateSQLDatabase = async () => {

            // Query our database
            const result = await this.fetchAll();
            console.log("What's in our results?");
            console.log(result);

            // Get our products from the result
            const resultsArray : SQLProduct[] = JSON.parse( JSON.stringify(result[0]) );

            // Create our new array of products will replace the old one with and eventually save it
            const newProducts = resultsArray.map((product : SQLProduct) => {

                // If the ID's the same, create our new array of
                if (product.productid === id) {

                    return {
                        title : title,
                        image : image,
                        description : description,
                        price : price, 
                        id : product.id,
                        productid : id
                    };
                }

                // Return the original product if it's not the one we're updating
                return product;
            });
            
            // Update the product in the database where the productId matches the id of the product to update
            const sqlQuery = (`UPDATE ${tableName} SET title = '${title}', image = '${image}', description = '${description}', price = ${price} WHERE productid = '${id}'`);

            await db.execute(sqlQuery);

            return newProducts;
        };

        // Run the update SQL database method, this updates our table in WorkBench
        return updateSQLDatabase();
    }

    deleteProduct = (id : string) => {

        // Outputting the id
        console.clear();

        // Get the current products
        const result = this.getProducts();

        // Filter the product based on the id
        const filteredProducts = result.filter((product : Product) => {
            return id !== product.id;
        });

        // Create the path to our file
        const p = path.join(
            rootDir, 
            "data",
            "products.json" 
        );

        // Read our saved file, we read it first to find the previous JSON and append to it
        fs.readFile(p, (err: NodeJS.ErrnoException, data: any) => {

            // If we fail at reading our file, create a new one
            if (err) {
                console.log( err );
            }else{

                // Stringify our JSON so we can save it to the appropriate file
                const json = JSON.stringify(filteredProducts, null, "\t");

                // Save the file to the folder, and if it doesn't exist, create it!
                fs.writeFileSync(p, json, "utf-8");
            }
        });

    };

    // Get the individual product for product details without the ability to edit it
    getProductById = (id : string) => {

        // Outputting the id
        console.clear();

        // Get the current products
        const result = this.getProducts();

        // Find the product information 
        const productDetail = result.find((product : Product) => {
            return product.id === id;
        });

        // Output the product detail
        return productDetail;
    }
}

export default Products;