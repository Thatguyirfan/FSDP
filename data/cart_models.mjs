import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;

export class ModelCart extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelCart.init({
			"uuid_product"  : { type: DataTypes.CHAR(36),    primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"uuid_user"     : { type: DataTypes.CHAR(36),    primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"img_location"	: { type: DataTypes.STRING(1024),	allowNull: true, defaultValue: "dynamic\\product_photos\\photo404"},	
			"name"          : { type: DataTypes.STRING(1024),  allowNull: false },
			"price"         : { type: DataTypes.DECIMAL(10,2), allowNull: false },
            "quantity"      : { type: DataTypes.INTEGER(32), allowNull: false },
		}, {
			"sequelize": database,
			"modelName": "Cart",
			"hooks"    : {
				"afterUpdate": ModelCart._auto_update_timestamp
			}
		});
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelCart}     instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}
	
}