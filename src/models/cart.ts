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
const p = path.join(
    rootDir, 
    "data",
    "products.json" 
);

type Product = {
    title : string,
    id : string,
    image : string,
    price : string,
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
    price ?: string,
    description ?: string
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

        // Get the result synchronously
        const productsList : Product[] = JSON.parse(fs.readFileSync(p, "utf-8"));

        // Check for an existing product
        const existingProduct = productsList.find((product : Product) => {
            return product.id === id;
        });

        // Updated product
        let updatedProduct : UpdatedProduct;

        if (existingProduct) {

            // 
            updatedProduct = { ...existingProduct };
            updatedProduct.quantity = updatedProduct.quantity++;
        } else{
            updatedProduct = { id : id, quantity : 1 };
        }

        return existingProduct;
    };

    // Add a cart item to the cart array
    public addCartItem = (product : Product) => {

        // Get the index of the array of cart items
        let itemExists : boolean = false;
    
        // Find the item in our cart if it already exists
        this.cartItems.forEach((cartItem : CartItem) => {

            // If the cart item exists
            if (cartItem.productId === product.id) {
                cartItem.quantity++;
                itemExists === true;
            }
        });

        // If the item doesn't exist in the cart, then create a new one
        if (itemExists === false) {
            
            this.cartItems.push({
                product : product,
                quantity : 0,
                productId : product.id
            });
        }
    };
};

export default Cart;