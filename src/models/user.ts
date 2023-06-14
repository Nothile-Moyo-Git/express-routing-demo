/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 */

import { sequelize } from "../util/database";
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";


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
    email : {
        type : DataTypes.STRING
    }
});

// Extending the sequelize model for typescript
class UserModel extends Model<InferAttributes<UserModel>,InferCreationAttributes<UserModel>>{

    // 'CreationOptional' is a special type that marks the field as optional
    // when creating an instance of the model (such as using Model.create()).

    declare id : CreationOptional<number>;
    declare name : string;
    declare email : string;
}

export { User };