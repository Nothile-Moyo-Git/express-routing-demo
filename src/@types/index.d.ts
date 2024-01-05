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

export interface StripeDataInterface{
    id : string,
    object : string,
    after_expiration : boolean | null,
    allow_promotion_codes : boolean | null,
    amount : number,
    amount_capturable : number,
    amount_details : any,
    amount_subtotal : number,
    amount_total : number,
    amount_received : number,
    automatic_tax : any,
    billing_address_collection : null,
    cancel_url : string,
    canceled_at : number | null,
    cancellation_reason: string | null,
    capture_method : string,
    client_secret : null,
    client_reference_id : null,
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
    description : string | null,
    expires_at : number,
    invoice : null,
    invoice_creation : any,
    last_payment_error : string | null,
    latest_charge : number | null,
    livemode : false,
    locale : null,
    metadata : {},
    mode : string,
    next_action : null,
    on_behald_of : null,
    payment_intent : null,
    payment_link : null,
    payment_method : string | null,
    payment_method_collection : string,
    payment_method_configuration_details : null,
    payment_method_options : {},
    payment_method_types : any[],
    payment_status : string,
    phone_number_collection : any,
    processing : null,
    receipt_email : null,
    review : null,
    recovered_from : null,
    setup_future_usage : null,
    setupIntent : null,
    shipping : null,
    source : null,
    statement_descriptor : null,
    statement_descriptor_suffix : null,
    shipping_address_collection : null,
    shipping_cost : null,
    shipping_details : null,
    shipping_options : [],
    status : string,
    submit_type : null,
    subscription : null,
    success_url : string,
    total_details : any,
    transfer_data : null,
    transfer_group : null,
    ui_mode : string,
    url : null
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
        id ?: string | ObjectId,
        object ?: string,
        api_version ?: string,
        created ?: number,
        livemode ?: boolean,
        pending_webhooks ?: number,
        request ?: {
            id : string | null,
            idempotency_key : string | null
        },
        type ?: string,
        data ?: StripeDataInterface
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