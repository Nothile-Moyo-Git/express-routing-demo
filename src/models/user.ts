/**
 * User model
 * 
 * Handles the functionality to allow a user to be able to create products
 * Also handles the functionality in order to have a user generated cart
 */

import { sequelize } from "../util/database";
import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes } from 'sequelize';

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

// Creating the attributes in the database so we can reference it
interface UserAttributes extends Model<any, any> {
    id : number,
    name : string,
    email : string
};

// Optional<UserAttributes, 'id'>>

// Extending the sequelize model for typescript
class UserModel extends Model<InferAttributes<UserAttributes>,InferCreationAttributes<Optional<UserAttributes, 'id'>>>{}

// Initialize our model
UserModel.init({
    
    // Model attributes are defined here
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
    },
},{
    
    // Other model options go here
    sequelize,
    modelName : "usermodel"
});

export { User, UserModel };

