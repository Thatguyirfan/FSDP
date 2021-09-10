import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;

export class ModelOrderDetails extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelOrderDetails.init({
			"uuid"               : { type: DataTypes.CHAR(36),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"uuid_user"          : { type: DataTypes.CHAR(36),     defaultValue: DataTypes.UUIDV4 },
			"completed_time"     : { type: DataTypes.CHAR(36),     allowNull: true},
			"order_time"		 : { type: DataTypes.CHAR(36),     allowNull: false},
			"delivery_status"    : { type: DataTypes.CHAR(20),     allowNull: false},
			"address"			 : { type: DataTypes.CHAR(64),     allowNull: false},
			"discount"           : { type: DataTypes.CHAR(36),     allowNull: true},
		}, {
			"sequelize": database,
			"modelName": "OrderDetails",
			"hooks"    : {
				"afterUpdate": ModelOrderDetails._auto_update_timestamp
			}
		});
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelOrderDetails}     instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}
	
}