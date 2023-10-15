/**
 * This is the utility methods file
 * This creates re-usable functions for different functionality which can be queried from here instead of in each file
 */

export const isInt = (number : any) => {
    return Number(number) === number && number % 1 === 0;
};

export const isFloat = (number : any) => {
    return Number(number) === number && number % 1 !== 0;
};