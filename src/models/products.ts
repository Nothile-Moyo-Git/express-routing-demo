/**
 * Products model
 * Currently creates an instance of the product class
 * This can add products or show them
 * 
 * @property products : Product[]
 * @method addProduct : (product Product) => void
 */

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

    addProduct = (product : Product) => {
        
        // Pushing to products
        // Add the new product to our array of products
        this.products.push(product);
    };

}

export default Products;