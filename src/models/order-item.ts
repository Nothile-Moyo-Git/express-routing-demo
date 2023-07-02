/**
 * Order item model
 * Currently used ORM with Sequelize in order to execute checkout functionality from the cart
 * The cart is associated with a user, currently this is using the userid
 * The order-item model creates an order item schema 
 */

import { sequelize } from "../util/database";
import { DataTypes } from "sequelize";

const SequelizeOrderItems = sequelize.define("orderItem",{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },
    quantity : DataTypes.INTEGER
});

export default SequelizeOrderItems;