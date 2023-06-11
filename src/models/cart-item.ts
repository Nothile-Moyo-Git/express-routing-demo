/**
 * Cart model
 * Currently used ORM with Sequelize in order to create a cart
 * The cart is associated with a user, currently this is using the userid
 * 
 * 
 */

import { sequelize } from "../util/database";
import { DataTypes } from "sequelize";

const SequelizeCartItem = sequelize.define("cartItem",{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },
    quantity : DataTypes.INTEGER
});

export default SequelizeCartItem;