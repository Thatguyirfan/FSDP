import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;


export class ModelEntry extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelEntry.init({
			"uuid"          : { type: DataTypes.CHAR(36),	primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"store"         : { type: DataTypes.STRING(64),	allowNull: false },
			"date"          : { type: DataTypes.DATE(),	allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			"entrytime"	    : { type: DataTypes.TIME(0),	allowNull: false },
			"nric"	        : { type: DataTypes.STRING(9),	allowNull: false },
            "temperature"   : { type: DataTypes.DOUBLE(3, 1),	allowNull: false },
            "mobile"        : { type: DataTypes.INTEGER(64),	allowNull: false },
			"exittime"		: { type: DataTypes.TIME(0),	allowNull: true, set(value){ this.setDataValue('exittime', value) } }
		}, {
			"sequelize": database,
			"modelName": "StoreEntries",
			"hooks"    : {
				"afterUpdate": ModelEntry._auto_update_timestamp
			}
		});
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelEntry}     instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}
}
