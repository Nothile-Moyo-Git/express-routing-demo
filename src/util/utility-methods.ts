/**
 * 
 * Author : Nothile Moyo
 * Date Written : 29/10/2023
 * License : MIT
 * 
 * This is the utility methods file
 * This creates re-usable functions for different functionality which can be queried from here instead of in each file
 * 
 * @method isInt = (number : any) => boolean
 * @method isFloat = (number : any) => boolean
 * @method isValidUrl = (number : any) => boolean
 * @method getCurrentDate = () => string
 * @method getFolderPathFromDate = () => string
 * @method getFileNamePrefixWithDate = () => string
 * @method createReadableDate : (date : Date) => string
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

export const getCurrentDate = () => {

    const today = new Date();

    // Get date values
    const yyyy = today.getFullYear();
    const mm = today.getMonth() + 1; // Months start at 0!
    const dd = today.getDate();

    // Convert date into usable string format we can concatenate
    let stringDay = dd.toString();
    let stringMonth = mm.toString();

    // Formatting the months and days to include 0 if it's less than 10
    if (dd < 10) { stringDay = '0' + dd.toString(); };
    if (mm < 10) { stringMonth = '0' + mm.toString(); };

    // Set the current date
    const ddmmyyyy : string = stringDay + '-' + stringMonth + '-' + yyyy;

    return ddmmyyyy;
};

/**
 * Returns the folder path for uploads with the year and month of the upload
 * This should be done recursively with a method for creating folders
 * 
 * @returns folderPath : string
 */
export const getFolderPathFromDate = () => {

    const today = new Date();

    // Get date values
    const yyyy = today.getFullYear();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();

    let stringDay = dd.toString();
    let stringMonth = mm.toString();

    // Formatting the date values to include 0 if it's less than 10
    if (dd < 10) { stringDay = '0' + dd.toString(); };
    if (mm < 10) { stringMonth = '0' + mm.toString(); };

    // Set the folder path structure
    const folderPath = yyyy + "/" + stringMonth + "/";

    return folderPath;
};

export const getFileNamePrefixWithDate = () => {

    const today = new Date();

    // Get date values
    const yyyy = today.getFullYear();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    const hh = today.getHours();
    const ii = today.getMinutes();
    const ss = today.getSeconds();

    let stringMonth = mm.toString();
    let stringDay = dd.toString();
    let stringHours = hh.toString();
    let stringMinutes = ii.toString();
    let stringSeconds = ss.toString();

    // Formatting the date values to include 0 if it's less than 10
    if (mm < 10) { stringMonth = '0' + mm.toString(); };
    if (dd < 10) { stringDay = '0' + dd.toString(); };
    if (hh < 12) { stringHours = '0' + hh.toString(); };
    if (ii < 10) { stringMinutes = '0' + ii.toString(); };
    if (ss < 10) { stringSeconds = '0' + ss.toString(); };

    // Set the folder path structure
    const fullPath = yyyy + "-" + stringMonth + "-" + stringDay + "_" + stringHours + "-" + stringMinutes + "-" + stringSeconds;

    return fullPath;
};

/**
 * @params date : Date
 * 
 * Formats the date into the format dd-mm-yy hh:ii:ss
 * 
 * Input a date in any format you wish and it will be converted for you
 * 
 * @returns date : String
 */
export const createReadableDate = (dateToFormat : Date) => {

    // Create a new date
    const date = new Date(dateToFormat);

    // Get date values
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const hh = date.getHours();
    const ii = date.getMinutes();
    const ss = date.getSeconds();

    let stringMonth = mm.toString();
    let stringDays = dd.toString();
    let stringHours = hh.toString();
    let stringMinutes = ii.toString();
    let stringSeconds = ss.toString();

    // Formatting the date values to include 0 if it's less than 10
    if (mm < 10) { stringMonth = '0' + mm.toString(); };
    if (dd < 10) { stringDays = '0' + dd.toString(); };
    if (hh < 12) { stringHours = '0' + hh.toString(); };
    if (ii < 10) { stringMinutes = '0' + ii.toString(); };
    if (ss < 10) { stringSeconds = '0' + ss.toString(); };

    const formattedDate = yyyy + "-" + stringMonth + "-" + stringDays + " " + stringHours + ":" + stringMinutes + ":" + stringSeconds; 

    return formattedDate;
};
