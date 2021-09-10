import e, { request, Router } from 'express';
import { flashMessage } from '../utils/flashmsg.mjs';
import { UploadFile, UploadTo, DeleteFile, DeleteFilePath } from '../utils/multer.mjs'; // help with uploading images
import { ModelProduct } from '../data/product_model.mjs'; // bring in product model
import { ModelLocation } from '../data/store_model.mjs'; // bring in location model
import { ModelUser, UserRole } from '../data/user_model.mjs';
import { ModelProductInstock } from '../data/productInstock_model.mjs';
import pkg from 'sequelize';
const { Op } = pkg;


import BodyParser from 'body-parser';
import { Console } from 'console';
// import { readBuilderProgram } from 'vscode-typescript';
var urlencodedParser = BodyParser.urlencoded({ extended: false });

const router = Router();
export default router;

/**
 * Regular expressions for form testing
 **/ 
const regexName  = /^[a-zA-Z][a-zA-Z]{2,}$/;

// CUSTOMER SEGMENT =====================================
router.get('/productView', viewAll);
router.post('/search', search);

router.get('/indivProd/:uuid', viewIndividual);


// ADMIN SEGMENT 	====================================
// [All the functions below only can be accessed if user is admin, can put in admin dashboard]

// view all products in stores
router.get('/adminProdView', adminProductView);
router.post('/adminSearch', adminSearch);

// create products
router.get('/create', display_createProduct);
router.post('/create', create_process);

// update products
router.get("/updateProduct/:uuid", updateProduct);
router.post("/updateProduct/:uuid", updateProduct_process);

// delete products
router.post("/deleteProduct/:uuid", deleteProduct);

// for admin to buy more stocks for particular branch (not working yet)
router.get("/orderInstock/:uuid", orderInstock);
router.post("/orderInstock/:uuid", orderInstock_process)

// for admin to upload product photo
router.get("/uploadPhoto/:uuid", uploadPhoto);
router.post("/uploadPhoto/:uuid", uploadPhoto_process);


// FUNCTIONS SEGMENT ====================================

// CUSTOMER FUNCTIONS	***********
/**
 * Render the Customer View All Products page
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function viewAll(req, res) {
    const title = "All Products | DON DON DONKI";
    var prod_list = [];

    if (req.query.name === undefined && req.query.category === undefined) {
        // if there is no query, just take all
        console.log("view all products");
        let prodModel = await ModelProduct.findAll({
            order: [
                ['name', 'ASC']
            ]
        });
        for (let i in prodModel) {
            prod_list.push(prodModel[i]);
        }
    }

    else {
        console.log("THERE IS QUERY");
        var query = req.query;
        // filtering by query name ==============
        if (query.name) {
            console.log("it has name, name =>", query.name);
            let prodModel = await ModelProduct.findAll({
                where: {
                    name: {
                        [Op.like]: `%${query.name}%`
                    }
                },
                raw: true
            });

            // Checking if the name even exists
            if (prodModel.length === 0) {
                console.log("unknown name");
                prod_list = [];
            }
            else {
                for (let i in prodModel) {
                    prod_list.push(prodModel[i]);	
                }
            }
        }

        // filtering by category ==================												NOT DONE YET, NEED TO ADD CATEGORY FOR PRODUCTS

        else if (query.category) {
            console.log("it has a category =>", query.category);
            var categoryList = ["fruits", "snacks", "drinks", "instantFood"];
            let prodModel;
            // don't use in for arrays!
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in
            // the in operator checks for index, so it'd be something like "0 in categoryList"
            // instead, you should use Array.prototype.includes
            if (categoryList.includes(query.category)) {
                switch (query.category) {
                    case "fruits":
                        console.log("category is fruit");
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'fruits'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                    case "snacks":
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'snacks'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                    case "drinks":
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'drinks'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                    case "instantFood":
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'instantFood'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                }
            }
            else {
                console.log("unknown category");
                prod_list = [];
            }
        };

    }

    if ("order" in req.query) {
        if (req.query.order === 'low_high') {
            console.log("user looking to sort by price low_high");
            prod_list.sort((a,b) => a.price - b.price);
        }
        else if(req.query.order === 'high_low') {
            console.log("user looking to sort by price high_low");
            prod_list.sort((a,b) => b.price - a.price);
        }
        else if(req.query.order === 'latest') {
            console.log("user looking to sort by date");
            prod_list.sort((a,b) => b.dateUpdated - a.dateUpdated);
        }
        else if(req.query.order == 'oldest') {
            console.log("user is looking for oldest product first");
            prod_list.sort((a,b) => a.dateUpdated - b.dateUpdated);
        }
    }
    res.render('products/allProducts.html', {title: title, prod_list: prod_list});
};

async function search(req, res){
    var search = req.body.search;
    var key = 'name';
    
    key = encodeURIComponent(key);
    var value = encodeURIComponent(search);

    // kvp looks like ['key1=value1', 'key2=value2', ...]
    var searchLocation = '/productView?';
    var kvp = searchLocation.substr(1).split('&');
    let i = 0;

    for (; i<kvp.length; i++) {
        if (kvp[i].startsWith(`${key}=`)) {
            let pair = kvp[i].split('=');
            pair[1] = value;
            kvp[i] = pair.join('=');
            break;
        }
    }

    if (i >= kvp.length) {
        kvp[kvp.length] = [key,value].join('=');
    }

    // can return this or...
    let params = kvp.join('&');

    // reload page with new params
    req.location = '/products/' + params;
    console.log(req.location);

    return res.redirect(req.location);
}
/**
 * Render the Customer View individual Products page
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function viewIndividual(req, res) {
    var locationList = [];
    let locationModel = await ModelLocation.findAll({
        order: [
            ['uuid', 'ASC'],
        ]
    });
    for (let i in locationModel) {
        locationList.push(locationModel[i]);
    }
    let prodModel = await ModelProduct.findOne({
        where: {
            uuid: req.params.uuid, // final product: use product uuid to find the product that is clicked on
        }, 
        raw: true
    }); // -> list will only include objects with the name "apple"

    var productInstockList = [];
    let productInstocksModel = await ModelProductInstock.findAll({
        where: {
            product_uuid: req.params.uuid
        },
        order: [
            ['location_uuid', 'ASC'] // LOCATION UUID ORDER MUST MATCH LOCATION LIST ORDER
        ]
    });

    for (let i in productInstocksModel) {
        productInstockList.push(productInstocksModel[i]);
    }

    // use await instead of Promise.then since this is an async function anyway
    const title = prodModel.name + "| DON DON DONKI"
    return res.render('products/individual.html', {title: title, product: prodModel, locationList: locationList, pdList: productInstockList});
};

// ADMIN FUNCTIONS		***********
// ALL FUNCTIONS BELOW ONLY CAN BE ACCESSED BY ADMIN  

/**
 * Render the admin Product view page
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function adminProductView(req, res) {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    // If user is not an employee or manager, redirect to dashboard
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }

    console.log("Admin Product View has been accessed.");
    const title = "Admin View Products | DON DON DONKI";
  
    // location List
    var locationList = [];
    let locationModel = await ModelLocation.findAll({
        order: [
            ['uuid', 'ASC'],
        ]
    });
    for (let i in locationModel) {
        locationList.push(locationModel[i]);
    }
    
    // product instock list
    var productInstockList = [];
    let productInstocksModel = await ModelProductInstock.findAll({
        order: [
            ['location_uuid', 'ASC'] // LOCATION UUID ORDER MUST MATCH LOCATION LIST ORDER
        ]
    });
    for (let i in productInstocksModel) {
        productInstockList.push(productInstocksModel[i]);
    }

    // product list
    var prod_list = [];

    if (req.query.name === undefined && req.query.category === undefined) {
        // if there is no query, just take all
        console.log("admin view all products");
        let prodModel = await ModelProduct.findAll({
            order: [
                ['name', 'ASC']
            ]
        });
        for (let i in prodModel) {
            prod_list.push(prodModel[i]);
        }
    }

    else {
        var query = req.query;
        // filtering by query name ==============
        if (query.name) {
            console.log("it has name, name =>", query.name);
            let prodModel = await ModelProduct.findAll({
                where: {
                    name: {
                        [Op.like]: `%${query.name}%`
                    }
                },
                raw: true
            });

            // Checking if the name even exists
            if (prodModel.length === 0) {
                console.log("unknown name");
                prod_list = [];
            }
            else {
                for (let i in prodModel) {
                    prod_list.push(prodModel[i]);	
                }
            }
        }

        // filtering by category ==================												NOT DONE YET, NEED TO ADD CATEGORY FOR PRODUCTS

        else if (query.category) {
            console.log("it has a category =>", query.category);
            var categoryList = ["fruits", "snacks", "drinks", "instantFood"];
            let prodModel;
            // don't use in for arrays!
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in
            // the in operator checks for index, so it'd be something like "0 in categoryList"
            // instead, you should use Array.prototype.includes
            if (categoryList.includes(query.category)) {
                switch (query.category) {
                    case "fruits":
                        console.log("category is fruit");
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'fruits'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                    case "snacks":
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'snacks'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                    case "drinks":
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'drinks'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                    case "instantFood":
                        prodModel = await ModelProduct.findAll({
                            where: {
                                category: {
                                    [Op.eq]: 'instantFood'
                                }
                            },
                            raw: true
                        });
                        for (let i in prodModel) {
                            prod_list.push(prodModel[i]);
                        }
                        break;
                }
            }
            else {
                console.log("unknown category");
                prod_list = [];
            }
        };

    }

    if ("order" in req.query) {
        if (req.query.order === 'low_high') {
            console.log("user looking to sort by price low_high");
            prod_list.sort((a,b) => a.price - b.price);
        }
        else if(req.query.order === 'high_low') {
            console.log("user looking to sort by price high_low");
            prod_list.sort((a,b) => b.price - a.price);
        }
        else if(req.query.order === 'latest') {
            console.log("user looking to sort by date");
            prod_list.sort((a,b) => b.dateUpdated - a.dateUpdated);
        }
        else if(req.query.order == 'oldest') {
            console.log("user is looking for oldest product first");
            prod_list.sort((a,b) => a.dateUpdated - b.dateUpdated);
        }
    }
    return res.render('products/admin_viewProduct.html', {title: title, prod_list: prod_list,  locationList: locationList, pdList: productInstockList});
};
async function adminSearch(req, res){
    var search = req.body.search;
    var key = 'name';
    
    key = encodeURIComponent(key);
    var value = encodeURIComponent(search);

    // kvp looks like ['key1=value1', 'key2=value2', ...]
    var searchLocation = '/adminProdView?';
    var kvp = searchLocation.substr(1).split('&');
    let i = 0;

    for (; i<kvp.length; i++) {
        if (kvp[i].startsWith(`${key}=`)) {
            let pair = kvp[i].split('=');
            pair[1] = value;
            kvp[i] = pair.join('=');
            break;
        }
    }

    if (i >= kvp.length) {
        kvp[kvp.length] = [key,value].join('=');
    }

    // can return this or...
    let params = kvp.join('&');

    // reload page with new params
    req.location = '/products/' + params;
    console.log(req.location);

    return res.redirect(req.location);
}
// CREATE PRODUCT
/**
 * Render the create product page
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
 async function display_createProduct(req, res) {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    // If user is not an employee or manager, redirect to dashboard
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    console.log("Register page accessed");
    const title = "Create Product | DON DON DONKI ADMIN"
    var locationList = [];
    let locationModel = await ModelLocation.findAll({
        order: [
            ['uuid', 'ASC']
        ]
    });
    for (let i in locationModel){
        locationList.push(locationModel[i]);
    }
    return res.render('products/createProduct.html', {title: title, locationList: locationList});
}

/**
 * Product creation process body
 * @param {import('express').Request}   req Express Request handle
 * @param {import('express').Response}  res Express Response handle
 */
async function create_process(req, res) {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    // If user is not an employee or manager, redirect to dashboard
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
  	console.log("Register contents received");
	console.log(req.body);

	// get location list ===============
	var locationList = [];
	let locationModel = await ModelLocation.findAll({
		order: [
			['uuid', 'ASC']
		]
	});
	for (let i in locationModel){
		locationList.push(locationModel[i]);
	};

	let errors = [];

  //	Check your Form contents (validation)
	try {
		const user = await ModelProduct.findOne({where: {name: req.body.name}});
		if (user != null) {
			errors = errors.concat({ text: "Product already exists! Update instead?" });
		}

		if (errors.length > 0) {
			console.log(errors);
			throw new Error("There are validation errors");
		}
	}
	catch (error) {
		console.error("There is errors with the registration form body.");
		console.error(error);
		return res.render('products/createProduct.html', { errors: errors });
	}

  //	Create new user, now that all the test above passed
	try {
		var name   			= req.body.name;
		var price  			= req.body.price;
		var desc 			= req.body.description;
		var ingred			= req.body.ingredients;
		var category		= req.body.category;
		var photo_location = "dynamic\product_photos\photo404.png";

		if (req.body.desc == ''){
			desc = null;
		}

		if (req.body.ingred == ''){
			ingred = null;
		}

		const p1 = await ModelProduct.create({
			name        	: 	name,
			price       	: 	price,
			description 	:	desc,
			ingredients 	:  	ingred,
			photo_location	:	photo_location,
			category		:	category
		});

		console.log("convetedf JSON => " + request.body);

		for (let i in locationList){

			var location_object = locationList[i];
			var location_uuid = location_object["uuid"];

			const l1 = await ModelProductInstock.create({
				location_uuid 	: location_object["uuid"],
				product_uuid	: p1.uuid,
				quantity		: req.body[location_uuid]
			})
		};

		return res.redirect("/products/adminProdView");
	}
	catch (error) {
		//	Else internal server error
		console.error(`Failed to create a new product: ${req.body.name} `);
		console.error(error);
		return res.status(500).end();
	}

}

// UPDATE PRODUCT
/**
 * Render the update product page
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function updateProduct(req, res) {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    // If user is not an employee or manager, redirect to dashboard
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    console.log("Update Product page accessed");
    const title = "UPDATE PRODUCT | DON DON DONKI"

    let indivProd = await ModelProduct.findOne({
        where: {
            uuid: req.params.uuid // final product: use product uuid to find the product that is clicked on
        }, 
        raw: true
    }); // -> list will only include objects with the name "apple"

    var productInstock = [];
    let productInstocksModel = await ModelProductInstock.findAll({
        where: {
            product_uuid: indivProd.uuid
        }, order: [
            ['product_uuid', 'ASC']
        ]
    });
    for (let i in productInstocksModel) {
        productInstock.push(productInstocksModel[i]);
    };

    var locationList = [];
    let locationModel = await ModelLocation.findAll({
        order: [
            ['uuid', 'ASC']
        ]
    });
    for (let i in locationModel) {
        locationList.push(locationModel[i]);
    };

    res.render('products/updateProduct.html', {title: title, x: indivProd, productInstock: productInstock, locationList: locationList});

};

/**
 * Render the update product process body
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function updateProduct_process(req, res) {
    console.log("Updating Product...");

    let product = await ModelProduct.findOne({where: {uuid: req.params.uuid}})
    await product.update({
        name	: req.body.name,
        price	: req.body.price,
        description		: req.body.description, 
        ingredients		: req.body.ingredients,
        photo_location	: req.body.upload_photo, 
        category		: req.body.category
    });

    var productInstocksList = [];
    let productInstocksModel = await ModelProductInstock.findAll({
        where: {
            product_uuid: req.params.uuid
        },
        order: [
            ['location_uuid', 'ASC']
        ]
    });
    for (let i in productInstocksModel){
        productInstocksList.push(productInstocksModel[i]);
    }

    var locationList = [];
    let locationModel = await ModelLocation.findAll({
        order: [
            ['uuid', 'ASC']
        ]
    });
    for (let i in locationModel) {
        locationList.push(locationModel[i]);
    };

    for (let x in locationList) {
        var location_uuid = locationList[x]["uuid"];
        await productInstocksList[x].update({
            location_uuid 	: location_uuid,
            product_uuid	: req.params.uuid,
            quantity		: req.body[location_uuid]
        })
    }

    return res.redirect('/products/adminProdView');
}; 

// DELETE PRODUCT
/**
 * Render the delete product process
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function deleteProduct(req, res) {
    await ModelProduct.destroy({
        where: {
            uuid : req.params.uuid
        }
    });
    await ModelProductInstock.destroy({
        where: {
            product_uuid: req.params.uuid
        }
    });
    return res.redirect("/products/adminProdView");
};

// BUY MORE INSTOCKS
/**
 * Render purchase more instocks page
 * @param {import('express;).Request} req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function orderInstock(req,res) {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    // If user is not an employee or manager, redirect to dashboard
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    console.log("Purchase Instocks page accessed");
    const title = "PURCHASE INSTOCKS | DON DON DONKI";

    // get individual product uuid for the name
    const productModel = await ModelProduct.findOne({
        where: {uuid: req.params.uuid},
        raw: true
    });

    // get location names
    var locationList = [];
    const locationModel = await ModelLocation.findAll({
        order: [
            ['uuid', 'ASC']
        ]
    });
    for (let i in locationModel) {
        locationList.push(locationModel[i])
    };

    // get productInstock
    var productInstockList = [];
    const productInstockModel = await ModelProductInstock.findAll({
        where: {product_uuid: req.params.uuid},
        order: [
            ['location_uuid', 'ASC']
        ]
    });
    for (let i in productInstockModel) {
        productInstockList.push(productInstockModel[i])
    }

    res.render('products/purchaseInstock.html', {title: title, x: productModel, locationList: locationList, pdList: productInstockList})

}

/**
 * Render purchase instocks process
 * @param {import('express').Request}  req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
 async function orderInstock_process(req, res) {
    console.log("Ordering Instock ...");

    // get productInstock list
    var productInstocksList = [];
    let productInstocksModel = await ModelProductInstock.findAll({
        where: {
            product_uuid: req.params.uuid
        },
        order: [
            ['location_uuid', 'ASC']
        ]
    });
    for (let i in productInstocksModel){
        productInstocksList.push(productInstocksModel[i]);
    }

    // get locationList
    var locationList = [];
    let locationModel = await ModelLocation.findAll({
        order: [
            ['uuid', 'ASC']
        ]
    });
    for (let i in locationModel) {
        locationList.push(locationModel[i]);
    };

    // update instocks
    for (let x in locationList) {
        var location_uuid = locationList[x]["uuid"];
        var new_value = productInstocksList[x]["quantity"];
        new_value = Number(new_value) + Number(req.body[location_uuid]);

        await productInstocksList[x].update({
            location_uuid 	: location_uuid,
            product_uuid	: req.params.uuid,
            quantity		: new_value
        })
    }

    return res.redirect('/products/adminProdView');
}; 

// UPLOAD PHOTOS
/**
 * Render the Upload Photo Page
 * @param {import('express;).Request} req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
async function uploadPhoto(req,res){
	const productObj = await ModelProduct.findOne({
		where: {uuid: req.params.uuid}
	});
	const title = productObj["name"] + " | UPLOAD PHOTO";

	return res.render('products/uploadPhoto.html', {title: title, x: productObj})
}

/**
 * Render the Upload Photo Process
 * @param {import('express;).Request} req Express Request handle
 * @param {import('express').Response} res Express Response handle
 */
 async function uploadPhoto_process(req,res){
	//	Create an uploader that uploads to "example" folder
	const Uploader = UploadTo("product_photos").single("file");
	return Uploader(req, res, async function (error_upload) {
		if (error_upload) {
			console.error(`An error has occurred during the uploading of file`);
			console.error(error_upload);
		}
		else {
            
			try {
				console.log (`File uploaded without problems`);
				console.log(req.params.uuid);
				console.log("FILE PATH: ", req.file.path);
				const filePath = req.file.path;

				await( await ModelProduct.findOne({
					where: {uuid: req.params.uuid}
				})).update({
					img_location: req.file.path
				});
				return res.redirect("/products/adminProdView");
			}
			catch (error) {
				console.error(`File is uploaded but something crashed`);
				console.error(error);
				DeleteFile(req.file);
				return res.sendStatus(400).end();
			}
		}
	});
}


// ==== SELF NOTES ====

/* THINGS NEED TO GET DONE
[ X ]	Create product 
X lacking each store instock
    X Different store, different instock.
    X WAREHOUSE INSTOCK FOR DELIVERY => for k to take note, maybe create a system so that the admin can add more stocks
- lacking product photos. Figure out how to upload images and save image location.
^^ ALL DONE, idk how to upload photos yet tho

[ X ]	Read Product (View on Admin side and customer side)
- lacking PICTURES. NO PRODUCT PHOTOS
- Product sorting and product  <=== SORTING AND SEARCH DONEE but find out how to add query search into params

[ X ]	Update Product	

[ X ]	Delete Product

*/

// ==== CODES NOTES ==== [ SELF REFERENCE ]
// 1. Create an uploader that uploads to "dynamic/productphoto" folder ==============================================

// const Uploader = UploadTo("product_photo").single("uploaded_photo");
// return Uploader(req, res, async function (error_upload) {
// 	if (error_upload) {
// 		console.error(`An error has occurred during the uploading of file`);
// 		console.error(error_upload);
// 	}
// 	else {
        
// 		try {
// 			console.log (`File uploaded without problems`);
// 			return res.render("example/uploaded", {
// 				path: req.file.path
// 			});
// 		}
// 		catch (error) {
// 			console.error(`File is uploaded but something crashed`);
// 			console.error(error);
// 			DeleteFile(req.file);
// 			return res.sendStatus(400).end();
// 		}
// 	}
// });
//	https://medium.com/swlh/how-to-upload-image-using-multer-in-node-js-f3aeffb90657 maybe this will help ?

// 2. MySQL Update, Retrieve and Delete ==============================================

//	Retrieve list of contents in your table
//	const list = ModelProduct.findAll({
// 	where: {
//		name : "apple"
// 	},
// 	limit: 20,
// 	offset: 30
//	}); -> list will only include objects with the name "apple"

//	Delete
//	ModelUser.destroy({
//	where: {
//	}
//	}); 

//	Update
// 	await (await ModelProduct.findOne()).update();

// 3. QUERY CODDES ===========
// 	req.params; // PATH PARAMETERS
// 	req.query;  // Query Parameters
// 	req.body;   // POST / Form Parameters
// 	https://sequelize.org/master/manual/model-querying-basics.html <=== should help with querying parameters and what querying can help do
