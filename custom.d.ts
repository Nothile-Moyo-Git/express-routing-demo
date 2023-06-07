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

// Create the user interface
interface UserInterface {
    id : number,
    name : string,
    email : string
}

// Extend our Request interface so we can now use a user
declare namespace Express {
    export interface Request {
       User?: UserInterface
    }
}