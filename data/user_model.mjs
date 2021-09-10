import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;

/**
 * For enumeration use
**/
export class UserRole {
	static get Manager() { return "manager"; }
    static get Employee() { return "employee"; }
	static get User()  { return "user";  }
}

/**
 * A database entity model that represents contents in the database.
 * This model is specifically designed for users
 * @see "https://sequelize.org/master/manual/model-basics.html#taking-advantage-of-models-being-classes"
**/
export class ModelUser extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelUser.init({
			"uuid"           : { type: DataTypes.CHAR(36),    primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"dateCreated"    : { type: DataTypes.DATE(),      allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			"dateUpdated"    : { type: DataTypes.DATE(),      allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			"name"           : { type: DataTypes.STRING(64),  allowNull: false },
			"email"          : { type: DataTypes.STRING(64), allowNull: false },
            "address"        : { type: DataTypes.STRING(128), allowNull: false },
			"password"       : { type: DataTypes.STRING(64),  allowNull: false },
			"role"           : { type: DataTypes.ENUM(UserRole.User, UserRole.Employee, UserRole.Manager), defaultValue: UserRole.User, allowNull: false },
			"phone"          : { type: DataTypes.STRING(8),     allowNull: false },
            "title"          : { type: DataTypes.STRING(32), allowNull: false, defaultValue: "Bronze Member" },
            "coins"          : { type: DataTypes.INTEGER(16), allowNull: false, defaultValue: 0 },
            "multiplier"     : { type: DataTypes.INTEGER(2), allowNull: false, defaultValue: 1 },
            "spent"          : { type: DataTypes.DECIMAL(10), allowNull: false, defaultValue: 0 },
            "hoursClocked"   : { type: DataTypes.DECIMAL(5), allowNull: false, defaultValue: 0 },
            "salary"         : { type: DataTypes.INTEGER(5), allowNull: false, defaultValue: 0 },
            "workingLocation": { type: DataTypes.STRING(64), allowNull: false, defaultValue: "None" },
            "nric"           : { type: DataTypes.STRING(9), allowNull: false, defaultValue: "S0000000A" },
			"schedule"       : { type: DataTypes.STRING(1000), allowNull: false, defaultValue: "{}"}
		}, {
			"sequelize": database,
			"modelName": "Users",
			"hooks"    : {
				"afterUpdate": ModelUser._auto_update_timestamp
			}
		});
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelUser}     instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}
}