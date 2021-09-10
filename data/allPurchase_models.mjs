import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;

export class ModelAllPurchase extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelAllPurchase.init({
			"uuid_user"          : { type: DataTypes.CHAR(36),     defaultValue: DataTypes.UUIDV4 },
            "uuid_orders"        : { type: DataTypes.CHAR(36),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            "uuid_product"       : { type: DataTypes.CHAR(36),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"quantity"           : { type: DataTypes.INTEGER(3),   allowNull: false},
		}, {
			"sequelize": database,
			"modelName": "AllPurchase",
			"hooks"    : {
				"afterUpdate": ModelAllPurchase._auto_update_timestamp
			}
		});
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelAllPurchase}     instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}
	
}