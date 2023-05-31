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
import { sequelize } from "../util/database";
import { DataTypes } from "sequelize";

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

// Sequelize object, creates our table if it doesn't exist
const SequelizeProducts = sequelize.define("sequelizeProducts", {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },
    title : DataTypes.STRING,
    image : {
        type : DataTypes.STRING,
        allowNull : false
    },
    description: {
        type : DataTypes.STRING,
        allowNull : false
    },
    price : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },
    productid : {
        type : DataTypes.STRING,
        allowNull : false
    }
});

class Products {

    // Products variable
    public products : SQLProduct[] = [];

    // Create an empty products array on class instantiation
    construtor(){
        this.products = [];
    };

    // Save to the products json file
    saveProduct = (product : Product) => {

        // Save the product to the SQL database
        const saveProductAsync = async() => {

            // Create insert query with sequelize
            await SequelizeProducts.create({
                title : product.title,
                image : product.image,
                price : Number(product.price),
                description : product.description,
                productid : product.id
            });

        };

        saveProductAsync();
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

    // Fetch all sequelize style
    fetchAllSequelize = () => {

        // Save the product to the SQL database
        const getProductsAsync = async() => {

            // Create insert query with sequelize
            return await SequelizeProducts.findAll({ raw : true });
        };

        return getProductsAsync();
    };

    // Fetch all products from the database
    fetchAll = () => {

        return db.execute("SELECT * FROM products");
    };

    // Update a single product in the JSON
    updateProduct = (title : string, image : string, description : string, price : number, id : string) => {

        // Update product async
        const updateSQLDatabase = async () => {

            // Query our database
            const result = await this.fetchAll();

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
                // fs.writeFileSync(p, json, "utf-8");
            }
        });

        // Delete the product from the SQL database
        const deleteProductAsync = async() => {

            // Sql query to delete the product from the database
            const sqlQuery = `DELETE FROM products WHERE productid = '${id}'`;

            // Execute the query
            await db.execute(sqlQuery);
        };

        // Execute the delete async code
        deleteProductAsync();

    };

    // Get the individual product for product details without the ability to edit it
    getProductById = (id : string) => {


        // Get a single product from the database by its id
        const getProductByIdAsync = async () => {

            // Sql query to get product by id
            const sqlQuery = `SELECT * FROM products WHERE productid = '${id}'`;

            // Execute our sql query
            const result = await db.execute(sqlQuery);

            // Get our products from the result
            const resultsArray : SQLProduct[] = JSON.parse( JSON.stringify(result[0]) );

            return resultsArray[0];
        };

        return getProductByIdAsync();
    }
}

export { SequelizeProducts };
export default Products;