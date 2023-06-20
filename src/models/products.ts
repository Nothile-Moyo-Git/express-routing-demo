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
import { sequelize } from "../util/database";
import { DataTypes } from "sequelize";

// Setting the interface for the Product objects
interface Product {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string,
    userId : number
};

interface SQLProduct {
    title : string,
    image : string,
    description : string,
    price : number,
    id : string,
    productid : number
};

// Sequelize object, creates our table if it doesn't exist
const SequelizeProducts = sequelize.define("products", {
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
    productId : {
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
                productId : product.id,
                userId : product.userId
            });

            // Get the updated products
            const result = await SequelizeProducts.findAll({
                raw : true
            });

            // Output the new products so we can render them on the products page
            return result;
        };

        const newProducts = saveProductAsync();

        // Return the new products array
        return newProducts;
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
    fetchAll = (userId : number) => {

        // Save the product to the SQL database
        const getProductsAsync = async() => {

            // Create insert query with sequelize
            return await SequelizeProducts.findAll({ 
                raw : true,
                where : {
                    userId : userId
                } 
            });
        };

        return getProductsAsync();
    };

    // Update a single product in the JSON
    updateProduct = (title : string, image : string, description : string, price : number, id : string, userId : number) => {

        // Update product async
        const updateSQLDatabase = async () => {

            // Query our database
            const result = await this.fetchAll( userId );

            // Create our new array of products will replace the old one with and eventually save it
            const newProducts = result.map((product : any) => {

                // If the ID's the same, create our new array of
                if (product.productid === id) {

                    return {
                        title : title,
                        image : image,
                        description : description,
                        price : price, 
                        id : product.id,
                        productId : id
                    };
                }

                // Return the original product if it's not the one we're updating
                return product;
            });
            
            // Update the result in our sequelize table
            await SequelizeProducts.update({ 
                title : title, 
                image : image, 
                description : description, 
                price : price 
            },{
                where : {
                    productId : id
                }
            })

            return newProducts;
        };

        // Run the update SQL database method, this updates our table in WorkBench
        return updateSQLDatabase();
    }

    deleteProduct = (id : string) => {

        // Delete products async method
        const deleteProductAsync = async () => {

            // Execute our sequelize query
            await SequelizeProducts.destroy({
                where : {
                    productId : id
                }
            });
        };

        // Execute our method
        deleteProductAsync();
    };

    // Get the individual product for product details without the ability to edit it
    getProductById = (id : string) => {

        // Get a single product from the database by its id
        const getProductByIdAsync = async () => {

            const sequelizeResult = await SequelizeProducts.findAll({
                raw : true,
                where : {
                    productId : id
                }
            });

            return sequelizeResult;
        };

        return getProductByIdAsync();
    }
}

export { SequelizeProducts };
export default Products;