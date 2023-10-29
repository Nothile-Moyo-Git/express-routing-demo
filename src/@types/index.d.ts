// Importing dependencies or generics or interfaces we're going to extend
import { ObjectId } from 'mongodb';
import { Session, SessionData } from "express-session";
import { Request } from 'express';

// Declare our modules to allow us to use files
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

declare module "*.jpeg"{
    const content: string;
    export default content;  
}

// Our custom types, they're defined here so that we use the DRY principle
export interface CartItemInterface{
    productId : ObjectId,
    title : string,
    quantity : number,
    price : number
}

export interface CartInterface{
    userId ?: ObjectId,
    totalPrice : number,
    items : CartItemInterface[]
}
export interface UserInterface{
    _id : ObjectId,
    name : string,
    email : string,
    password ?: string,
    cart ?: CartInterface,
    resetToken ?: string,
    resetTokenExpiration ?: Date
}

export interface ExtendedSessionDataInterface extends SessionData {
    isLoggedIn : boolean,
    user : UserInterface,
    csrfToken : string,
    cart ?: CartInterface
}

export interface ExtendedRequestInterface extends Request{
    User : UserInterface,
    body : {
        title : string,
        image : string,
        price : number,
        description : string,
        csrfToken : string,
        productId ?: ObjectId,
        emailInput ?: string,
        resetToken ?: string,
        previousPasswordInput ?: string,
        newPasswordInput ?: string,
        confirmNewPasswordInput ?: string,
        nameInput ?: string,
        passwordInput ?: string,
        secondPasswordInput ?: string,
    }
    isAuthenticated : boolean,
    session : Session & Partial<ExtendedSessionDataInterface>
}

export interface ProductInterface{
    _id : ObjectId,
    title : string,
    price : number,
    description ?: string,
    image ?: string,
    userId ?: ObjectId
}

// Defining our interfaces and our type in order to use TypeScript with Mongoose
export interface OrderItemInterface {
    title : string,
    price : number,
    quantity : number
}

export interface OrderInterface {
    totalPrice : number,
    orderItems : OrderItemInterface[],
    createdAt : Date,
    updatedAt : Date,
    user : {
        _id : ObjectId,
        name : string
    }
}

export interface UserMethodsInterface {
    addToCart : (product : ProductInterface) => void,
    deleteFromCart : (productId : string) => void,
    emptyCart : () => void,
    generateHash : (password : string) => string,
    validatePassword : (password : string) => boolean
}
