/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 */

import { sequelize } from "../util/database";
import { DataTypes } from "sequelize";

// Sequelize object, creates our table if it doesn't exist
const User = sequelize.define("user", {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },
    name : {
        type : DataTypes.STRING
    },
    image : {
        type : DataTypes.STRING
    }
});

export { User };