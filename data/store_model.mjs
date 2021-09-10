import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;


export class ModelLocation extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelLocation.init({
			"uuid"      	: { type: DataTypes.CHAR(36),		primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"name"       	: { type: DataTypes.STRING(64),		allowNull: false },
			"address"      	: { type: DataTypes.STRING(1024),	allowNull: false },
			"phoneNo"   	: { type: DataTypes.INTEGER(10),	allowNull: true },
			"openingHours"	: { type: DataTypes.STRING(64),		allowNull: true }, 
			"iframe_link" 	: { type: DataTypes.STRING(1024), 	allowNull: true}
		}, {
			"sequelize": database,
			"modelName": "Location",
			"hooks"    : {
				"afterUpdate": ModelLocation._auto_update_timestamp
			}
		});
	}

	// get image_url() {
	// 	return `/dynamic/product/${this.getDataValue("img_location")}`;
	// }

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelLocation}  instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}

	// GETTER METHODS ====
	/** The role of the user */
	get role()  	{ return String(this.getDataValue("role")); }
	/** The universally unique identifier of the user */
	get uuid()  	{ return String(this.getDataValue("uuid")); }

	get name() 		    { return String(this.getDataValue("name")); }
	get address()		{ return Int32Array(this.getDataValue("price")); }
	get phoneNo() 		{ return String(this.getDataValue("dateCreated")); }
	get openingHours()	{ return String(this.getDataValue("dateUpdated")); }
	get iframe_link()	{ return String(this.getDataValue("iframe_link")); }

	// SETTER METHODS ====
	set uuid(uuid)		            { this.setDataValue("uuid", uuid); }
	set name(name)		            { this.setDataValue("name", name); }
	set address(address)	        { this.setDataValue("address", address); }
	set phoneNo(phoneNo)        	{ this.setDataValue("phoneNo", phoneNo); }
	set openingHours(openingHours)	{ this.setDataValue("openingHours", openingHours); }
	set iframe_link(iframe_link)	{ this.setDataValue("iframe_link", iframe_link); }
}