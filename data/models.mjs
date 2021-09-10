import Hash   from 'hash.js'
import ORM    from 'sequelize';
const { Sequelize } = ORM;

import { ModelUser } 	from './user_model.mjs';
import { ModelProduct } from './product_model.mjs';
import { ModelCart } from './cart_models.mjs';
import { ModelFeedback } from './feedback_model.mjs';
import { ModelEntry } from './entry_model.mjs';
import { ModelCustomerCard } from './customercard_models.mjs';
import { ModelLocation } from './store_model.mjs'
import { ModelOrderDetails } from './orderDetails_model.mjs';
import { ModelAllPurchase } from './allPurchase_models.mjs';
import { ModelProductInstock } from './productInstock_model.mjs';
import { ModelVoucher } from './voucher_model.mjs';

/**
 * @param database {ORM.Sequelize}
 */
export function initialize_models(database) {
	try {
		console.log("Intitializing ORM models");
		//	Initialize models
		ModelUser.initialize(database);
		ModelProduct.initialize(database);
		ModelCart.initialize(database)
		ModelFeedback.initialize(database);
		ModelEntry.initialize(database);
		ModelCustomerCard.initialize(database);
		ModelLocation.initialize(database);
		ModelOrderDetails.initialize(database);
		ModelAllPurchase.initialize(database);

		ModelProductInstock.initialize(database);
		ModelVoucher.initialize(database);

		console.log("Building ORM model relations and indices");
		//	Create relations between models or tables
		//	Setup foreign keys, indexes etc
	
		console.log("Adding intitialization hooks");
		//	Run once hooks during initialization
		database.addHook("afterBulkSync", generate_root_account.name,  	generate_root_account.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_product.name, 	generate_dummy_product.bind(this, database));
		database.addHook("afterBulkSync", generate_location.name,		generate_location.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_cart.name, 	generate_dummy_cart.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_feedback.name, generate_dummy_feedback.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_entry.name, generate_dummy_entry.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_card.name, generate_dummy_card.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_entry.name, 	generate_dummy_entry.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_orderDetails.name, generate_dummy_orderDetails.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_allPurchase.name, generate_dummy_allPurchase.bind(this, database));
		database.addHook("afterBulkSync", generate_dummy_product_instock.name,	generate_dummy_product_instock.bind(this, database));
	}
	catch (error) {
		console.error ("Failed to configure ORM models");
		console.error (error);
	}
}

/**
 * This function creates a root account 
 * @param {Sequelize} database Database ORM handle
 * @param {SyncOptions} options Synchronization options, not used
 */
 async function generate_root_account(database, options) {
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_root_account.name);
	//	Create a root user if not exists otherwise update it
	try {
		console.log("Generating root administrator account");
		const root_parameters = {	
			uuid    : "00000000-0000-0000-0000-000000000000",
			name    : "root",
			email   : "root@mail.com",
			role    : "manager",
			address : "123 Test Lane",
            phone   : "90000000",
            title   : "Manager",
            salary  : 4000,
            workingLocation: "Test Branch",
            nric    : "S1234567A",
			password: Hash.sha256().update("P@ssw0rd").digest("hex")
		};
		//	Find for existing account with the same id, create or update
		var account = await ModelUser.findOne({where: { "uuid": root_parameters.uuid }});
		
		account = await ((account) ? account.update(root_parameters): ModelUser.create(root_parameters));
		
		console.log("== Generated root account ==");
		console.log(account.toJSON());
		console.log("============================");
		return Promise.resolve();
	}
	catch (error) {
		console.error ("Failed to generate root administrator user account");
		console.error (error);
		return Promise.reject(error);
	}
}

// xh Product Table, Store Location table, Product Instock Table ==================
async function generate_dummy_product(database, options) {
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_product.name);
	//	Create a root user if not exists otherwise update it
	// try {
	// 	console.log("Generating dummy product");
	// 	const root_parameters = {	
	// 		uuid			: "00000000-0000-0000-0000-000000000000",
	// 		name			: "orange",
	// 		price			: 1.00,
	// 		description		: "Imported from Japan", 
	// 		ingredients		: null, 
	// 		img_location	: "dynamic/product_photos/photo404.png",
	// 		category		: "fruits"
	// 	};
	// 	//	Find for existing account with the same id, create or update
	// 	var product = await ModelProduct.findOne({where: { "uuid": root_parameters.uuid }});
		
	// 	product = await ((product) ? product.update(root_parameters): ModelProduct.create(root_parameters));
		
	// 	console.log("== Generated dummy product ==");
	// 	console.log(product.toJSON());
	// 	console.log("============================");
	// 	return Promise.resolve();
	// }
	// catch (error) {
	// 	console.error ("Failed to generate dummy product");
	// 	console.error (error);
	// 	return Promise.reject(error);
	// }
}

async function generate_location(database, options) {
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_location.name);
	//	Create a root user if not exists otherwise update it
	try {
		console.log("Generating store locations");
		// =================
		const warehouse = {	// information gotten from https://www.jobstreet.com.sg/en/companies/1000420-don-don-donki
			uuid			: "00000000-0000-0000-0000-000000000000",
			name			: "Warehouse",
			address			: "12, Marina Boulevard #34-03, Marina Bay Financial Centre Tower 3 018982 Singapore",
			phoneNo			: 61234567, 
			openingHours	: "10am-12am", 
			iframe_link		: "https://maps.google.com/maps?q=12,%20Marina%20Boulevard,%20Marina%20Bay%20Financial%20Centre%20Tower%203&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		var location = await ModelLocation.findOne({where: { "name": warehouse.name }});
		location = await ((location) ? location.update(warehouse): ModelLocation.create(warehouse));
		console.log("== Generated warehouse ==");

		// =================
		const clarkeQuay = {	
			name			: "Clarke Quay Central",
			address			: "6 Eu Tong Sen Street, #B1, 11-28/44-51 The Central, 059817",
			phoneNo			: 62262311, 
			openingHours	: "10am-12am", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20clarke%20quay&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		var location = await ModelLocation.findOne({where: { "name": clarkeQuay.name }});
		location = await ((location) ? location.update(clarkeQuay): ModelLocation.create(clarkeQuay));
		console.log("== Generated Clarke Quay ==");

		// =================
		const orchardCentral = {	
			name			: "Orchard Central",
			address			: "181 Orchard Road Orchard Central, #B2 01-10/30/43 & #B1 15-29/K7, K8, 238896",
			phoneNo			: 68344311, 
			openingHours	: "24 Hrs", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20orchard%20Central&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": orchardCentral.name }});
		location = await ((location) ? location.update(orchardCentral): ModelLocation.create(orchardCentral));
		console.log("== Generated Orchard Central ==");

		// =================
		const citySqMall = {	
			name			: "City Square Mall",
			address			: "180 Kitchener Rd, #B2 05/18, Singapore 208539",
			phoneNo			: 66341711, 
			openingHours	: "9am-12am", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20city%20square%20mall&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": citySqMall.name }});
		location = await ((location) ? location.update(citySqMall): ModelLocation.create(citySqMall));
		console.log("== Generated City Square Mall ==");

		// =================
		const sq2 = {	
			name			: "Square 2",
			address			: "10 Sinaran Dr, #B1-01/85, Singapore 307506",
			phoneNo			: 62541711, 
			openingHours	: "9am-11pm", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20square%202&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": sq2.name }});
		location = await ((location) ? location.update(sq2): ModelLocation.create(sq2));
		console.log("== Generated Square 2 ==");

		// =================
		const hundredAM = {	
			name			: "100AM",
			address			: "100 Tras Street 100AM, #02 01- 05/22-26, #03 01-05/09-23, 079027",
			phoneNo			: 62498811, 
			openingHours	: "9am-11pm", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20100AM&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": hundredAM.name }});
		location = await ((location) ? location.update(hundredAM): ModelLocation.create(hundredAM));
		console.log("== Generated 100AM ==");

		// =================
		const jCube = {	
			name			: "JCube",
			address			: "2 Jurong East Central 1, Basement 1, #L2, Jurong East Central 1, Singapore 609731",
			phoneNo			: 66941811, 
			openingHours	: "10am-11pm", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20jcube&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": jCube.name }});
		location = await ((location) ? location.update(jCube): ModelLocation.create(jCube));
		console.log("== Generated JCube ==");

		// =================
		const jem = {	
			name			: "Jem",
			address			: "50 Jurong Gateway Road Jem, #02-24/26 & #03-27/29, 608549",
			phoneNo			: 66941011, 
			openingHours	: "9am-12am", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20Jem&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": jem.name }});
		location = await ((location) ? location.update(jem): ModelLocation.create(jem));
		console.log("== Generated Jem ==");

		// =================
		const downTownEast = {	
			name			: "Downtown East",
			address			: "1 Pasir Ris Close, Downtown East E!Avenue 01-339, Singapore 519399",
			phoneNo			: 62441311, 
			openingHours	: "9am-12am", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20downtown%20east&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": downTownEast.name }});
		location = await ((location) ? location.update(downTownEast): ModelLocation.create(downTownEast));
		console.log("== Generated Downtown East ==");

		// =================
		const suntec = {	
			name			: "Sunctec City",
			address			: "3 Temasek Boulevard Suntec City Mall, Tower 5, West Wing, #02-379-387, Singapore 038983",
			phoneNo			: 62507211, 
			openingHours	: "9am-11pm", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20suntec&t=&z=13&ie=UTF8&iwloc=&output=embed"	
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": suntec.name }});
		location = await ((location) ? location.update(suntec): ModelLocation.create(suntec));
		console.log("== Generated Suntec City ==");

		// =================
		const harbourfront = {	
			name			: "HarbourFront Centre",
			address			: "1 Maritime Square, #03-23 / 38 HarbourFront Centre, Singapore 099253",
			phoneNo			: 62611211, 
			openingHours	: "10am-11pm", 
			iframe_link		: "https://maps.google.com/maps?q=don%20don%20donki%20Harbourfront&t=&z=13&ie=UTF8&iwloc=&output=embed"
		};
		//	Find for existing account with the same id, create or update
		location = await ModelLocation.findOne({where: { "name": harbourfront.name }});
		location = await ((location) ? location.update(harbourfront): ModelLocation.create(harbourfront));
		console.log("== Generated HarbourFront Centre ==");


		console.log(location.toJSON());
		console.log("============================");
		return Promise.resolve();
	}
	catch (error) {
		console.error ("Failed to generate dummy product");
		console.error (error);
		return Promise.reject(error);
	}
}

async function generate_dummy_product_instock(database, options) {  // temp cart
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_product_instock.name);
	// //	Create a root user if not exists otherwise update it
	// try {
	// 	console.log("Generating dummy product instock information");
	// 	const root_parameters = {	
	// 		location_uuid	: "00000000-0000-0000-0000-000000000000",
	// 		product_uuid	: "00000000-0000-0000-0000-000000000000",
	// 		quantity		: 20
	// 	};
	// 	//	Find for existing account with the same id, create or update
	// 	var productInstock = await ModelProductInstock.findOne({where: { "product_uuid": root_parameters.product_uuid } && { "location_uuid": root_parameters.location_uuid }});
		
	// 	productInstock = await ((productInstock) ? productInstock.update(root_parameters): ModelProductInstock.create(root_parameters));
		
	// 	console.log("== Generated dummy product instock information ==");
	// 	console.log(productInstock.toJSON());
	// 	console.log("============================");
	// 	return Promise.resolve();
	// }
	// catch (error) {
	// 	console.error ("Failed to generate dummy product instock information");
	// 	console.error (error);
	// 	return Promise.reject(error);
	// }
}
// =================================================================================

async function generate_dummy_cart(database, options) {  // temp cart
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_cart.name);
	//	Create a root user if not exists otherwise update it
	// try {
	// 	console.log("Generating dummy cart");
	// 	const root_parameters = {	
	// 		uuid_product	: "00000000-0000-0000-0000-000000000000",
	// 		uuid_user       : "00000000-0000-0000-0000-000000000000",
	// 		name			: "apple",
	// 		price			: 1.00,
	// 		quantity		: 1
	// 	};
	// 	//	Find for existing account with the same id, create or update
	// 	var cart = await ModelCart.findOne({where: { "uuid_product": root_parameters.uuid_product } && { "uuid_user": root_parameters.uuid_user }});
		
	// 	cart = await ((cart) ? cart.update(root_parameters): ModelCart.create(root_parameters));
		
	// 	console.log("== Generated dummy cart ==");
	// 	console.log(cart.toJSON());
	// 	console.log("============================");
	// 	return Promise.resolve();
	// }
	// catch (error) {
	// 	console.error ("Failed to generate dummy cart");
	// 	console.error (error);
	// 	return Promise.reject(error);
	// }
}

async function generate_dummy_feedback(database, options) {  // temp feedback
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_feedback.name);

	var curdate = new Date();

  	var currdate = curdate.getFullYear() + "-" +
    ("0" + (curdate.getMonth()+1)).slice(-2) + "-" +
    ("0" + curdate.getDate()).slice(-2);

	//	Create a root user if not exists otherwise update it
	try {
		console.log("Generating dummy feedback");
		const root_parameters = {	
			uuid      : "00000000-0000-0000-0000-000000000000",
			name      : "Irfan",
			mobile    : "87654321",
			email	  : "test@mail.com",
			store	  : "Orchard Central",
            reason    : "Compliment",
            message   : "test",
			date 	  : currdate, 
			status	  : 1
		};
		//	Find for existing account with the same id, create or update
		var feedback = await ModelFeedback.findOne({where: { "uuid": root_parameters.uuid }});
		
		feedback = await ((feedback) ? feedback.update(root_parameters): ModelFeedback.create(root_parameters));
		
		console.log("== Generated dummy feedback ==");
		console.log(feedback.toJSON());
		console.log("============================");
		return Promise.resolve();
	}
	catch (error) {
		console.error ("Failed to generate dummy feedback");
		console.error (error);
		return Promise.reject(error);
	}
}

async function generate_dummy_entry(database, options) {  // temp entry
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_entry.name);

	var curdate = new Date();

  	var currdate = curdate.getFullYear() + "-" +
    ("0" + (curdate.getMonth()+1)).slice(-2) + "-" +
    ("0" + curdate.getDate()).slice(-2);

	//	Create a root user if not exists otherwise update it
	try {
		console.log("Generating dummy entry");
		const root_parameters = {	
			uuid          : "00000000-0000-0000-0000-000000000000",
			store         : "Jem",
			date          : currdate,
			entrytime	  : "09:00",
			nric	      : "T0123456A",
            temperature   : "37.5",
            mobile        : "12345678",
			exittime 	  : "10:00"
		};
		//	Find for existing account with the same id, create or update
		var entry = await ModelEntry.findOne({where: { "uuid": root_parameters.uuid }});
		
		entry = await ((entry) ? entry.update(root_parameters): ModelEntry.create(root_parameters));
		
		console.log("== Generated dummy entry ==");
		console.log(entry.toJSON());
		console.log("============================");
		return Promise.resolve();
	}
	catch (error) {
		console.error ("Failed to generate dummy entry");
		console.error (error);
		return Promise.reject(error);
	}
}

async function generate_dummy_card(database, options) {  
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_card.name);
	//	Create a root user if not exists otherwise update it
	try {
		console.log("Generating dummy card");
		const root_parameters = {	
			uuid	        : "00000000-0000-0000-0000-000000000000",
			uuid_user       : "00000000-0000-0000-0000-000000000000",
			card_name		: "John Lim",
			card_number		: "1111-2222-3333-4444",
			card_type       : "VISA",
			expiry			: "11/24",
			CVV				: 313
		};
		//	Find for existing account with the same id, create or update
		var card = await ModelCustomerCard.findOne({where: { "uuid": root_parameters.uuid }});

		card = await ((card) ? card.update(root_parameters): ModelCustomerCard.create(root_parameters));
		
		console.log("== Generated dummy card ==");
		console.log(card.toJSON());
		console.log("============================");
		return Promise.resolve();
	}
	catch (error) {
		console.error ("Failed to generate dummy card");
		console.error (error);
		return Promise.reject(error);
	}
}

async function generate_dummy_orderDetails(database, options) {  
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_orderDetails.name);
	//	Create a root user if not exists otherwise update it

	try {
		console.log("Generating dummy order details");
		const root_parameters = {	
			uuid	        	: "00000000-0000-0000-0000-000000000000",
			uuid_user	        : "00000000-0000-0000-0000-000000000000",
			completed_time      : null,
			order_time          : "13/08/2021 13:17:20",
			delivery_status     : "PACKING",
			address             : "blk 123",
			discount            : null,
		};
		//	Find for existing account with the same id, create or update
		var orderDetails = await ModelOrderDetails.findOne({where: { "uuid": root_parameters.uuid }});

		orderDetails = await ((orderDetails) ? orderDetails.update(root_parameters): ModelOrderDetails.create(root_parameters));
		
		console.log("== Generated dummy order details ==");
		console.log(orderDetails.toJSON());
		console.log("============================");
		return Promise.resolve();
	}
	catch (error) {
		console.error ("Failed to generate dummy order details.");
		console.error (error);
		return Promise.reject(error);
	}
}

async function generate_dummy_allPurchase(database, options) {  
	//	Remove this callback to ensure it runs only once
	database.removeHook("afterBulkSync", generate_dummy_allPurchase.name);
	//	Create a root user if not exists otherwise update it
	try {
		console.log("Generating dummy all purchase");
		const root_parameters = {	
			uuid_user	        : "00000000-0000-0000-0000-000000000000",
			uuid_orders	        : "00000000-0000-0000-0000-000000000000",
			uuid_product	    : "00000000-0000-0000-0000-000000000000",
			quantity			: 5,
		};
		//	Find for existing account with the same id, create or update
		var allPurchase = await ModelAllPurchase.findOne({where: { "uuid_product": root_parameters.uuid_product } && { "uuid_orders": root_parameters.uuid_orders }});

		allPurchase = await ((allPurchase) ? allPurchase.update(root_parameters): ModelAllPurchase.create(root_parameters));
		
		console.log("== Generated dummy all purchase ==");
		console.log(allPurchase.toJSON());
		console.log("============================");
		return Promise.resolve();
	}
	catch (error) {
		console.error ("Failed to generate dummy all purchase.");
		console.error (error);
		return Promise.reject(error);
	}
}