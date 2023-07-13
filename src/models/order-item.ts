/**
 * Order item model
 * Currently used ORM with Sequelize in order to execute checkout functionality from the cart
 * The cart is associated with a user, currently this is using the userid
 * The order-item model creates an order item schema 
 * 
 * Custom attributes are set for the createdAt and updatedAt fields in order to work with the current infastructure
 * The order and product id values are also set to unique : false in order to ignore errors associated with one to many relationships
 */

import { sequelize } from "../util/database";
import { DataTypes } from "sequelize";

const SequelizeOrderItems = sequelize.define("orderItems",{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
        unique : false
    },
    quantity : DataTypes.INTEGER,
    orderId : {
        type : DataTypes.INTEGER,
        unique : false
    },
    productId : {
        type : DataTypes.INTEGER,
        unique : false
    },
    createdAt : {
        type: "TIMESTAMP",
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,  
    },
    updatedAt : {
        type: "TIMESTAMP",
        defaultValue: sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
        allowNull: false,
    }
});

export default SequelizeOrderItems;