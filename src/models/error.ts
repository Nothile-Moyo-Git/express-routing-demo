/**
 * Author : Nothile
 * Date Created : 01/11/2023
 * License : MIT
 * 
 * This is the error class. It defines a custom error class which has httpStatusCode inside of it
 * We do this so we can handle our 500 responses properly and render the appropriate view using express
 * 
 * @class CustomError
 */

class CustomError extends Error {
    // Define our httpStatusCode which we can pass through since we don't innately have httpStatusCode
    public httpStatusCode : number;

    // Constructor to instantiate the Custom Error class
    constructor(message : string, httpStatusCode : number) {
        super(message);
        this.name = "CustomError";
        this.httpStatusCode = httpStatusCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    };
};

export default CustomError;