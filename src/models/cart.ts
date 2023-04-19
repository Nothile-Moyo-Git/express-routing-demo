/**
 * Cart model. Contains the cart class.
 * The cart class stores a list of all products that have been stored for the customer to checkout.
 * Cart items can be updated, added or removed
 * 
 * @class Cart
 * @method addCartItem : (product : Product) => {}
 * @method removeCartItem : (product : Product) => {}
 */

interface Product {
    title : string,
    id : string
}

interface CartItem{
    product : Product,
    quantity : number,
    productId : string
}

class Cart {

    // Our variables that we will be updating
    public cartItems : CartItem[];
    public totalNumberOfCartItems : number;

    // Create an empty array of cartItems when we instantiate our class
    constructor(){
        this.cartItems = [];
        this.totalNumberOfCartItems = 0;
    };

    // Add a cart item to the cart array
    addCartItem = (product : Product) => {

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

    // Remove an item from the cart
    removeCartItem = () => {

    };

};

export default Cart;