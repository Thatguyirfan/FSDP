import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;


export class ModelProductInstock extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelProductInstock.init({
			"location_uuid" : { type: DataTypes.CHAR(36),   primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"product_uuid"  : { type: DataTypes.CHAR(),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"quantity"  	: { type: DataTypes.INTEGER(),  allowNull: false, defaultValue: 0},
			"lastUpdate"    : { type: DataTypes.DATE(),     allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
		}, {
			"sequelize": database,
			"modelName": "ProductInstocks",
			"hooks"    : {
				"afterUpdate": ModelProductInstock._auto_update_timestamp
			}
		});
	}

	get image_url() {
		return `/dynamic/product/${this.getDataValue("img_location")}`;
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelProductInstock}  instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.lastUpdate = Sequelize.literal('CURRENT_TIMESTAMP');
	}

	// GETTER METHODS ====
	/** The universally unique identifier of the user */
	get location_uuid() { return String(this.getDataValue("location_uuid")); }
	get product_uuid()  { return String(this.getDataValue("product_uuid")); }
	get quantity()		{ return Int32Array(this.getDataValue("quantity")); }
	get lastUpdate()    { return Date(this.getDataValue("lastUpdate")); }

	// SETTER METHODS ====
	set location_uuid(location_uuid){ this.setDataValue("location_uuid", location_uuid); }
	set product_uuid(product_uuid)  { this.setDataValue("product_uuid", product_uuid); }
	set quantity(quantity)          { this.setDataValue("quantity", quantity); }
}