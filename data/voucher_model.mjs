// used/expired attribute or just delete from table?

import ORM from 'sequelize'
const { Sequelize, DataTypes, Model } = ORM;

import { generate } from 'randomstring';


export class ModelVoucher extends Model {
	/**
	 * Initializer of the model
	 * @see Model.init
	 * @access public
	 * @param {Sequelize} database The configured Sequelize handle
	**/
	static initialize(database) {
		ModelVoucher.init({
			"code"      	: { type: DataTypes.CHAR(),		    primaryKey: true, defaultValue: generate(10) },
			"issueDate"	    : { type: DataTypes.DATE(),			allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			"expiryDate"	: { type: DataTypes.DATE(),			allowNull: false },
			"value"       	: { type: DataTypes.INTEGER(),		allowNull: false },
            "valid"         : { type: DataTypes.BOOLEAN(),      allowNull: false, defaultValue: true }
		}, {
			"sequelize": database,
			"modelName": "Vouchers",
			"hooks"    : {
				"afterUpdate": ModelVoucher._auto_update_timestamp
			}
		});
	}

	/**
	 * Emulates "TRIGGER" of "AFTER UPDATE" in most SQL databases.
	 * This function simply assist to update the 'dateUpdated' timestamp.
	 * @private
	 * @param {ModelVoucher}  instance The entity model to be updated
	 * @param {UpdateOptions} options  Additional options of update propagated from the initial call
	**/
	static _auto_update_timestamp(instance, options) {
		// @ts-ignore
		instance.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
	}
}