/**
 * This is the utility methods file
 * This creates re-usable functions for different functionality which can be queried from here instead of in each file
 * 
 * @method isInt = (number : any) => boolean
 * @method isFloat = (number : any) => boolean
 * @method isValidUrl = (number : any) => boolean
 */

export const isInt = (number : any) => {
    return Number(number) === number && number % 1 === 0;
};

export const isFloat = (number : any) => {
    return Number(number) === number && number % 1 !== 0;
};

export const isValidUrl = (url : string) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
    '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    return !!urlPattern.test(url);
};