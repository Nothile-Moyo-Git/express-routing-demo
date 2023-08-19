/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 * When checking if we have users or when querying them, we extend the WithId<Document> interface so we can work with the cursor Id's
 * Since the cart has a 1 to 1 relation 
 * 
 * @method save : async() => void
 * @method updateTotalPrice : () => void
 * @method getUsers : static async() => []
 * @method getRootUser : static async () => {user}
 * @method createIfRootIsNull : async () => {user}
 * @method findById : static async () => {user}
 */

class User {

};

export default User;