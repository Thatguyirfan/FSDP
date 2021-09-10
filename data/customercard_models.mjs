import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;

export class ModelCustomerCard extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelCustomerCard.init({
			"uuid"          : { type: DataTypes.CHAR(36),   primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			"uuid_user"     : { type: DataTypes.CHAR(36),   allowNull: false},
			"card_name"     : { type: DataTypes.CHAR(64),   allowNull: false},
			"card_number"   : { type: DataTypes.CHAR(19),   allowNull: false},
			"card_type"     : { type: DataTypes.CHAR(10),   allowNull: false},
			"expiry"     	: { type: DataTypes.CHAR(5),    allowNull: false},
			"CVV"     		: { type: DataTypes.INTEGER(4), allowNull: false},
		}, {
			"sequelize": database,
			"modelName": "CustomerCard",
			"hooks"    : {
				"afterUpdate": ModelCustomerCard._auto_update_timestamp
			}
		});
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelCustomerCard}     instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}
	
}