import { Router } from 'express';
const router = Router();
export default router;

import { ModelCart } from '../data/cart_models.mjs';
import { ModelProduct } from '../data/product_model.mjs';
import { ModelOrderDetails } from '../data/orderDetails_model.mjs';
import { ModelAllPurchase } from '../data/allPurchase_models.mjs';
import { ModelUser, UserRole } from '../data/user_model.mjs';
import { ModelProductInstock } from '../data/productInstock_model.mjs';
import { ModelLocation } from '../data/store_model.mjs'; 

import BodyParser from 'body-parser';
var urlencodedParser = BodyParser.urlencoded({ extended: false });

// customer
router.get('/', async (req, res) => {
    req.params; // PATH PARAMETERS
    req.query;  // Query Parameters
    req.body;   // POST / Form Parameters  
    const title = "Purchase History | DON DON DONKI";

    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }

  // --------------------------------------------------------------//

    // get orders to ship --> packing 
    let ordersToShip = await ModelOrderDetails.findAll({
        where: {
            uuid_user: res.locals.session.userID,
            delivery_status: "PACKING"
        },
        raw: true
    });
    var shipOrderDetails = [];
    var finalProdShipList = [];
    var shipCount = []; // use this to access multiple list 

    for (let i in ordersToShip) {
       
        var tempProdShipList = [];
        let toShip = await ModelAllPurchase.findAll({
            where: {
                uuid_orders: ordersToShip[i].uuid
            },
            raw: true 
        });
        shipCount.push(i);
        shipOrderDetails.push(toShip);

        for (let j in toShip) {
            let product = await ModelProduct.findOne({
                where: {
                    uuid: toShip[j].uuid_product
                },
                raw: true 
            });
            tempProdShipList.push(product);
        }
        finalProdShipList.push(tempProdShipList);
    }

    // get the number of items in an order
    var quantityShipList = [];
    for (let i in shipOrderDetails) {
        var quantity = 0;
        for (let x in shipOrderDetails[i]) {
            quantity += shipOrderDetails[i][x].quantity;
        }
        quantityShipList.push(quantity);
    }
    // remove all 0s
    for (let z in quantityShipList) {
        if (quantityShipList[z] === 0) {
            quantityShipList.splice(quantityShipList[z]);
        }
    }
  
    // ----------------------------------------------------------------------//

    // get orders to recieve --> OTW 
    let ordersToRecieve = await ModelOrderDetails.findAll({
        where: {
          uuid_user: res.locals.session.userID,
          delivery_status: "OTW"
        },
        raw: true 
    });
    
    var recieveOrdersDetails = [];
    var finalProdRecList = [];
    var recieveCount = []; // use this to access multiple list 
    for (let i in ordersToRecieve) {

        var tempProdRecList = [];
        let toRecieve = await ModelAllPurchase.findAll({
            where: {
                uuid_orders: ordersToRecieve[i].uuid
            },
            raw: true 
        });
        recieveCount.push(i);
        recieveOrdersDetails.push(toRecieve);

        for (let j in toRecieve) {
            let product = await ModelProduct.findOne({
                where: {
                    uuid: toRecieve[j].uuid_product
                },
                raw: true 
            });
            tempProdRecList.push(product);  
        }
        finalProdRecList.push(tempProdRecList);
    }
  
    // get the number of items in an order
    var quantityRecList = [];
    for (let i in recieveOrdersDetails) {
        var quantity = 0;
        for (let x in recieveOrdersDetails[i]) {
            quantity += recieveOrdersDetails[i][x].quantity;
        }
        quantityRecList.push(quantity);
    }
    // remove all 0s
    for (let z in quantityRecList) {
        if (quantityRecList[z] === 0) {
            quantityRecList.splice(quantityRecList[z]);
        }
    }

    // ------------------------------------------------------------------------// 

    // get orders completed
    let ordersComp = await ModelOrderDetails.findAll({
        where: {
            uuid_user: res.locals.session.userID,
            delivery_status: "COMPLETED"
        },
        raw: true
    });
    var compOrderDetails = [];
    var finalProdCompList = [];
    var compCount = []; // use this to access multiple list 
    for (let i in ordersComp) {
      
        var tempProdCompList = [];

        let toShip = await ModelAllPurchase.findAll({
            where: {
                uuid_orders: ordersComp[i].uuid
            },
            raw: true 
        });
        compCount.push(i);
        compOrderDetails.push(toShip);

        for (let j in toShip) {
            let product = await ModelProduct.findOne({
                where: {
                    uuid: toShip[j].uuid_product
                },
                raw: true 
            });
            tempProdCompList.push(product);
        }
        finalProdCompList.push(tempProdCompList);
    }

    // get the number of items in an order
    var quantityCompList = [];
    for (let i in compOrderDetails) {
        var quantity = 0;
        for (let x in compOrderDetails[i]) {
            quantity += compOrderDetails[i][x].quantity;
        }
        quantityCompList.push(quantity);
    }
    // remove all 0s
    for (let z in quantityCompList) {
        if (quantityCompList[z] === 0) {
            quantityCompList.splice(quantityCompList[z]);
        }
    }
  
	return res.render('orders/purchaseHistory.html', {
        title: title,
        ordersToShip: ordersToShip,
        ordersToRecieve: ordersToRecieve,
        ordersComp: ordersComp,
        shipOrderDetails: shipOrderDetails,
        shipCount: shipCount,
        quantityShipList: quantityShipList,
        finalProdShipList: finalProdShipList,
        recieveOrdersDetails: recieveOrdersDetails,
        recieveCount: recieveCount,
        quantityRecList: quantityRecList,
        finalProdRecList: finalProdRecList,
        compOrderDetails: compOrderDetails,
        compCount: compCount,
        quantityCompList: quantityCompList,
        finalProdCompList: finalProdCompList
    }); 
});

router.get('/thankyou', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    const title = "Thank You | DON DON DONKI";  

    // get current date
    var date = new Date();
    var today = `${`0${date.getDate()}`.slice(-2)}/${`0${date.getMonth() + 1}`.slice(-2)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  
    // create order
    try {
        console.log("creating order..");
        await ModelOrderDetails.create({
            uuid_user         :  res.locals.session.userID,
            complete_time     :  null,
            order_time        :  today,
            delivery_status   :  "PACKING",
            address           :  user.address,
            discount 	      :  null
        });
    }
	catch (error) {
		//	Else internal server error
		console.error(`Failed to create a new order: ${req.body.name}`);
		console.error(error);
		return res.status(500).end();
	}

    let order = await ModelOrderDetails.findOne({
        where: {
            uuid_user: res.locals.session.userID,
            order_time: today
        },
        raw: true 
    }); 

    let cart = await ModelCart.findAll({
        where: {
            uuid_user: res.locals.session.userID 
        },
        raw: true 
    });
    if (cart === null || cart.length === 0) {
        return res.redirect('/user/dashboard');
    }

    let location = await ModelLocation.findOne({
        where: {
            name: "Warehouse"
        },
        raw: true 
    });

    let orderTotal = 0;
    for (let i in cart) {
        // add order and products to allPurchase 
        console.log("adding to allPurchase");
        console.log("cart: ", cart[i]);
        orderTotal += parseInt(cart[i].price) * parseInt(cart[i].quantity);
        try {
            console.log("adding products and order in allPurchase..");
            await ModelAllPurchase.create({
                uuid_user       :  res.locals.session.userID,
                uuid_orders     :  order.uuid,
                uuid_product    :  cart[i].uuid_product,
                quantity 	    :  cart[i].quantity
            });
        }
        catch (error) {
            //	Else internal server error
            console.error(`Failed to create a new allPurchasee: ${req.body.name} `);
            console.error(error);
            return res.status(500).end();
        }
        let productStocks = await ModelProductInstock.findOne({
            where: {
                product_uuid: cart[i].uuid_product,
                location_uuid: location.uuid
            }
        });

        var quantity = productStocks.quantity;
        console.log("productstoc:", productStocks);

        await productStocks.update({
            location_uuid 	: location.uuid,
            product_uuid	: cart[i].uuid_product,
            quantity		: Number(quantity) - Number(cart[i].quantity)
        })

        // remove everything from cart
        await ModelCart.destroy({
            where: {
                uuid_product: cart[i].uuid_product,
                uuid_user: res.locals.session.userID 
            }
        });
    }

    console.log("order total:", orderTotal);

    let userSpent = parseInt(user.spent);
    let userCoins = parseInt(user.coins);
    let userMultiplier = parseInt(user.multiplier);
    user.spent = userSpent = userSpent + orderTotal;
    user.coins = userCoins = userCoins + orderTotal * userMultiplier;
    if (user.title !== "Platinum Member") {
        if (userSpent > 14999) {
            user.multiplier = userMultiplier = 4;
            user.title = "Platinum Member";
        }
        else if (userSpent > 4999) {
            user.multiplier = userMultiplier = 3;
            user.title = "Gold Member";
        }
        else if (userSpent > 1999) {
            user.multiplier = userMultiplier = 2;
            user.title = "Silver Member";
        }
    }
    await user.save();
    return res.render('orders/thankyou.html', {title: title});
});

// admin 
router.get('/updateOrders', async (req,res) => {
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

    const title = "Admin View Orders | DON DON DONKI";
    let packingOrders = await ModelOrderDetails.findAll({ 
        where: {
            delivery_status: "PACKING"
        } 
    });


    // get current date
    var date = new Date();
    var today = parseInt(("0" + date.getDate()).slice(-2));

	var todayMonth = parseInt(("0" + (date.getMonth()+1)));
    var diffList = [];
    
    for (let i in packingOrders) {
        var packingMonth = parseInt(packingOrders[i].order_time.substring(4, 6));
        var packingDate = parseInt(packingOrders[i].order_time.substring(0, 2));
        if (packingMonth == todayMonth)
        {
            var diff = 0;
            while (packingDate < today)
            {
                packingDate = packingDate + 1;
                diff += 1;
            }
            diffList.push(diff);
        }
        else
        {
            var diff = 0;
            while (packingDate < 32)
            {
                packingDate = packingDate + 1;
                diff += 1;
            }
            packingDate = 1;
            while (packingDate < today)
            {
                packingDate = packingDate + 1;
                diff += 1;
            }
            diffList.push(diff);
        }
    }

    let otwOrders = await ModelOrderDetails.findAll({ 
        where: {
            delivery_status: "OTW"
        }
    });

    let completedOrders = await ModelOrderDetails.findAll({ 
        where: {
            delivery_status: "COMPLETED"
        }
    });
    res.render('orders/updateOrder.html', {title: title, packingOrders: packingOrders, diffList: diffList, otwOrders: otwOrders, completedOrders: completedOrders});
});



router.post('/update/:uuid', urlencodedParser, async (req, res) => {
    const order = await ModelOrderDetails.findOne({ 
        where: {
            uuid: req.params.uuid
        }
    });
   
    order.delivery_status = req.body.delivery;
    if (req.body.delivery === "COMPLETED") {
        // get current date
        var date = new Date();
        var today = `${`0${date.getDate()}`.slice(-2)}/${`0${date.getMonth() + 1}`.slice(-2)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        order.completed_time = today;
    }

    order.save();
    return res.redirect('/orders/updateOrders');
});
