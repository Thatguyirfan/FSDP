import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;


export class ModelProduct extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelProduct.init({
			"uuid"      	: { type: DataTypes.CHAR(36),		primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"dateCreated"	: { type: DataTypes.DATE(),			allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			"dateUpdated"	: { type: DataTypes.DATE(),			allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			"name"       	: { type: DataTypes.STRING(1024),		allowNull: false },
			"price"      	: { type: DataTypes.DECIMAL(10,2),	allowNull: false },
			"description"	: { type: DataTypes.STRING(1024),	allowNull: true },
			"ingredients"	: { type: DataTypes.STRING(1024),	allowNull: true }, 
			"img_location"	: { type: DataTypes.STRING(1024),	allowNull: true, defaultValue: "dynamic\\product_photos\\photo404"},
			"category"		: { type: DataTypes.STRING(100), 	allowNull: false }
		}, {
			"sequelize": database,
			"modelName": "Products",
			"hooks"    : {
				"afterUpdate": ModelProduct._auto_update_timestamp
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
	 * @param {ModelProduct}  instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}

	// GETTER METHODS ====
	/** The role of the user */
	get role()  		{ return String(this.getDataValue("role")); }
	/** The universally unique identifier of the user */
	get uuid()  		{ return String(this.getDataValue("uuid")); }
	get dateCreated()	{ return Date(this.getDataValue("dateCreated")); }
	get dateUpdated()	{ return Date(this.getDataValue("dateUpated")); }
	get name() 			{ return String(this.getDataValue("name")); }
	get price()			{ return Int32Array(this.getDataValue("price")); }
	get desc() 			{ return String(this.getDataValue("description")); }
	get ingred()		{ return String(this.getDataValue("ingredients")); }
	get category()		{ return String(this.getDataValue("category")); }

	// SETTER METHODS ====
	set uuid(uuid)			{ this.setDataValue("uuid", uuid); }
	set name(name)			{ this.setDataValue("name", name); }
	set price(price)		{ this.setDataValue("price", price); }
	set desc(desc)			{ this.setDataValue("description", desc); }
	set ingred(ingred)		{ this.setDataValue("ingredients", ingred); }
	set category(category) 	{this.setDataValue("category", category); }
}