// Importing dependencies or generics or interfaces we're going to extend
import { ObjectId } from 'mongodb';

declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "*.png" {
    const content: string;
    export default content;
}

declare module "*.html" {
    const content: string;
    export default content;
}

declare module "*.jpg"{
    const content: string;
    export default content;
}

// Our custom types, they're defined here so that we use the DRY principle
interface CartItemInterface{
    productId : ObjectId,
    title : string,
    quantity : number,
    price : number
}

export {CartItemInterface};