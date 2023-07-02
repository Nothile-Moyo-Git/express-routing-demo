/**
 * Order model
 * Used to allow checkout functionality from the cart page
 * 
 * 
 */

import { sequelize } from "../util/database";
import { DataTypes } from "sequelize";

const SequelizeOrders = sequelize.define("order",{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    }
});

export default SequelizeOrders;