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

export interface StripeRequestInterface{
    type ?: string,
    request ?: {
        id : string | null,
        idempotency_key : string | null
    },
    pending_webhooks ?: number,
    livemode ?: boolean,
    id : string,
    object : string,
    api_version : string,
    created : number,
    data ?: {
        object ?: {
            id : string,
            object : string,
            after_expiration : boolean | null,
            allow_promotion_codes : boolean | null,
            amount_subtotal : number,
            amount_total : number,
            automatic_tax : any,
            billing_address_collection : null,
            cancel_url : string,
            client_reference_id : null,
            client_secret : null,
            consent : null,
            consent_collection : null,
            created : number,
            currency : string,
            currency_conversion : null,
            custom_fields : [],
            custom_text : any,
            customer : null,
            customer_creation : string,
            customer_details : null,
            customer_email : null,
            expires_at : number,
            invoice : null,
            invoice_creation : any,
            livemode : false,
            locale : null,
            metadata : {},
            mode : string,
            payment_intent : null,
            payment_link : null,
            payment_method_collection : string,
            payment_method_configuration_details : null,
            payment_method_options : {},
            payment_method_types : any[],
            payment_status : string,
            phone_number_collection : any,
            recovered_from : null,
            setupIntent : null,
            shipping_address_collection : null,
            shipping_cost : null,
            shipping_details : null,
            shipping_options : [],
            status : string,
            submit_type : null,
            subscription : null,
            success_url : string,
            total_details : any,
            ui_mode : string,
            url : null
        }
    }
}

export interface CustomError extends Error{
    httpStatusCode : number
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
        imageUrl : string,
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
    fileName : string,
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