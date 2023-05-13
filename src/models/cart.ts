/**
 * Cart model. Contains the cart class.
 * The cart class stores a list of all products that have been stored for the customer to checkout.
 * Cart items can be updated, added or removed
 * 
 * @class Cart
 * @method addCartItem : (product : Product) => {}
 * @method removeCartItem : (product : Product) => {}
 */

import fs from "fs";
import path from "path";
import rootDir from "../util/path";

// Create the path to our file
const productsPath = path.join(
    rootDir, 
    "data",
    "products.json" 
);

const cartPath = path.join(
    rootDir,
    "data",
    "cart.json"
);

type Product = {
    title : string,
    id : string,
    image : string,
    price : number,
    description : string
};

type CartItem = {
    product : Product,
    quantity : number,
    productId : string,
};

type UpdatedProduct = {
    quantity ?: number,
    title ?: string,
    id ?: string,
    image ?: string,
    price ?: number,
    description ?: string
};

type CartJSON = {
    products : UpdatedProduct[],
    totalPrice : number
};

class Cart {

    // Our variables that we will be updating
    public cartItems : CartItem[];
    public totalPrice : number;
    public totalNumberOfCartItems : number;

    // Create an empty array of cartItems when we instantiate our class
    constructor(){
        this.cartItems = [];
        this.totalPrice = 0;
        this.totalNumberOfCartItems = 0;
    };

    // Static add product
    static addProduct = (id : string) => {

        // Initialise an empty cart JSON
        let cart = { products : [], totalPrice : 0 };
        let cartData, cartProducts;

        // Get the result synchronously from the file
        cart.products = JSON.parse( fs.readFileSync(productsPath, "utf-8") );

        // Get the products from the cart in order to see if they exist
        cartData = JSON.parse( fs.readFileSync(cartPath, "utf-8") );

        // Loop through the products and check if the id's are the same as the cart.json
        // If they are, then take the quantity from that
        // If not, then create an empty quantity
        // This will be the new list of products we'll store to the cart.json file
        cartProducts = cart.products.map((product : UpdatedProduct, index : number) => {

            // Don't use this index as it's unreliable Nothile
            // You'll need to find the individual value like the find below, then use that quantity or initialise it to 0
            const quantity = cartData.products[index] ? cartData.products[index].quantity : 0;  

            return{
               title : product.title,
               image : product.image,
               description : product.description,
               price : product.price,
               id : product.id,
               quantity : quantity
            };
        });

        // Override the cart with the new one
        cart.products = cartProducts;

        // Check for an existing product
        const existingProduct = cartProducts.find((product : UpdatedProduct) => {
            return product.id === id;
        });

        // Find the index of the existing product
        const existingProductIndex = cartProducts.findIndex((product : UpdatedProduct) => {
            return product.id === id;
        });

        // Updated product
        let updatedProduct : UpdatedProduct;

        if (existingProduct) {

            // Create a new updated product with a quantity
            updatedProduct = { ...existingProduct };
            updatedProduct.quantity = updatedProduct.quantity + 1;

            cart.products[existingProductIndex] = updatedProduct;
            
            // Keep the cart the same
            cart.products = [...cart.products];

        } else{

            updatedProduct = { id : id, quantity : 1 };
            cart.products = [...cart.products, updatedProduct];
            // Add the updated product to the cart
        }

        // Add to the total price
        cart.totalPrice = cartData.totalPrice + Number(updatedProduct.price);
        
        // Stringify our JSON so we can save it to the appropriate file
        const json = JSON.stringify(cart, null, "\t");

        // Save the file to the folder, and if it doesn't exist, create it!
        fs.writeFileSync(cartPath, json, "utf-8");

        return updatedProduct;
    };

    // Delete a product and remove it from the total price
    static deleteProduct = (id : string) => {

        // Create the path to our file
        const p = path.join(
            rootDir, 
            "data",
            "products.json" 
        );

        // Get the products from the cart in order to see if they exist
        const cartData : CartJSON = JSON.parse( fs.readFileSync(cartPath, "utf-8") );

        let totalPrice = cartData.totalPrice;

        // Cart products
        const newCartProducts = cartData.products.filter((product : UpdatedProduct) => {

            // If the id of the product is the same as the one we're deleting
            // Get the quantity and price, and remove it from the totalPrice
            if (product.id === id) {

                // Updated total price
                totalPrice = totalPrice - (product.quantity * product.price);
            }

            return product.id !== id;
        });

        // Create a new cart with the updated totalPrice and the item removed
        // This is executed alongside deleting the product in the JSON file
        const newCart : CartJSON = { products : newCartProducts, totalPrice : totalPrice };

        // Read our saved file, we read it first to find the previous JSON and append to it
        fs.readFile(p, (err: NodeJS.ErrnoException, data: any) => {

            // If we fail at reading our file, create a new one
            if (err) {
                console.log( err );
            }else{

                // Stringify a JSON
                const json = JSON.stringify(newCart, null, "\t");

                // Save the file to the folder, and if it doesn't exist, create it!
                fs.writeFileSync(cartPath, json, "utf-8");
            }
        });
    };
};

export default Cart;