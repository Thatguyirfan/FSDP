import { Router } from 'express';
const router = Router();
export default router;

import { ModelCart } from '../data/cart_models.mjs';
import { ModelCustomerCard } from '../data/customercard_models.mjs';
import { ModelProduct } from '../data/product_model.mjs';
import { ModelUser } from '../data/user_model.mjs';
import { ModelVoucher } from '../data/voucher_model.mjs';

import BodyParser from 'body-parser';
var urlencodedParser = BodyParser.urlencoded({ extended: false });

router.get('/', async (req,res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    req.params; // PATH PARAMETERS
    req.query;  // Query Parameters
    req.body;   // POST / Form Parameters  
    const title = "Cart | DON DON DONKI";
    let cart = await ModelCart.findAll({
        where: {
            uuid_user: res.locals.session.userID 
        },
        raw: true 
    }); 
    const cartList = [];
    var total = 0;

    for (let i in cart) 
    {
        let product = await ModelProduct.findOne({
            where: {
                uuid: cart[i].uuid_product
            },
            raw: true 
        }); 
        if (product == undefined)
        {
            await ModelCart.destroy({
                where: {
                    uuid_product :  cart[i].uuid_product
                }
            });
        }
        else
        {
            cartList.push(cart[i]);
            total += cart[i].price * cart[i].quantity;
        }
    }
    console.log("this the cart: ");
    console.log(cartList);
    console.log("this is the total: ", total);
	return res.render('cart/cart.html', {title: title, cartList: cartList, total: total}); 
});


router.get('/addToCart/:uuid', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    console.log("user: ",res.locals.session.userID );
    // check if its in cart alrdy
    let cartItem = await ModelCart.findOne({
        where: {
            uuid_product: req.params.uuid,
            uuid_user: res.locals.session.userID 
        },
        raw: true 
    });
 
    if (cartItem === null) {
        // add to cart
        let product = await ModelProduct.findOne({
            where: {
                uuid: req.params.uuid
            },
            raw: true 
        }); 

        console.log("selected product => ", product);
        try { 
            await ModelCart.create({
                uuid_product:  product.uuid,
                uuid_user   :  res.locals.session.userID,
                img_location:  product.img_location,
                name        :  product.name,
                price       :  product.price,
                quantity    :  1
            });
        }
        catch (error) {
            //	Else internal server error
            console.error(`Failed to add to cart: ${req.body.name} `);
            console.error(error);
            return res.status(500).end();
        }
    
    }
    else {
        // update quantity
        console.log("update quantity!");
        addQuantity(req, res);
    }
    return res.redirect("/products/productView");
});

router.get('/addQuantity/:uuid', addQuantity);

async function addQuantity(req, res) {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    const item = await ModelCart.findOne({ 
        where: {
            uuid_product: req.params.uuid,
            uuid_user: res.locals.session.userID 
        } 
    });
    item.quantity += 1;
    console.log("item.quantity after update: ", item.quantity);
    if (item.quantity <= 0){
        await item.destroy();
    }
    else {
        console.log(item.uuid_user, item.name);
        item.save();
        return res.redirect('/cart');
    }
};

router.get('/minusQuantity/:uuid', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    const item = await ModelCart.findOne({ 
        where: {
            uuid_product: req.params.uuid,
            uuid_user: res.locals.session.userID 
        } 
    });
    item.quantity -= 1;
    console.log("item.quantity after update: ", item.quantity);
    if (item.quantity <= 0) {
        await item.destroy();
    }
    else {
        item.save();
    }
    return res.redirect('/cart');
});

router.get('/deleteItem/:uuid', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    await ModelCart.destroy({
        where: {
            uuid_product : req.params.uuid,
            uuid_user: res.locals.session.userID 
        }
    });
    return res.redirect("/cart");
});

router.get('/clearCart', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    console.log("clearing cart..");
    let cart = await ModelCart.findAll({
        where: {
            uuid_user: res.locals.session.userID 
        },
        raw: true 
    }); 
    for (let i in cart) {
        await ModelCart.destroy({
            where: {
                uuid_product : cart[i].uuid_product,
                uuid_user: res.locals.session.userID 
            }
        });
    }
    return res.redirect("/cart");
});


// router.post('/checkout', checkout);

router.get('/checkout', checkout);
async function checkout(req, res) { 
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }

    const title = "Check Out | DON DON DONKI";

    // Check if voucher code input has any input
    const bodyvoucher = req.query.voucher === undefined ? "" : req.query.voucher

    if ((bodyvoucher !== "") || (bodyvoucher.length !== 0)) {
        // Check if voucher exists
        var voucher = await ModelVoucher.findOne({
            where: {
                code: bodyvoucher
            }
        });

        if (voucher === null) {
            console.log("invalid");
            // Return to cart page with alert saying "Invalid Voucher Code"
            res.locals.session.invalidCode = true;
        }

        else if (!voucher.valid) {
            console.log("redeemed");
            // Return to cart page with alert saying "Voucher has been redeemed"
            res.locals.session.usedCode = true;
        }

        else if (Date.now() > voucher.expiryDate.getTime()) {
            // Update voucher validity (invalid)
            console.log("expired");
            try {
                await ModelVoucher.update({valid: false}, {where: {code: bodyvoucher}});
            }
            catch (error) {
                console.error("Failed to update voucher");
                console.error(error);
            }
            // Return to cart page with alert saying "Voucher has expired"
            res.locals.session.expiredCode = true;
        }

        else {
            // Update voucher (redeemed)
            try {
                await ModelVoucher.update({valid: false}, {where: {code: bodyvoucher}})
                res.locals.session.deductTotal = true;
            }

            catch (error) {
                console.error("Failed to update voucher");
                console.error(error);
            }
        }
    }

    // If voucher invalid/redeemed/expired, set msg for alert
    var msg = "";
    if (res.locals.session.invalidCode) {
        msg = "Invalid Voucher Code";
        res.locals.session.invalidCode = false;
    }
    else if (res.locals.session.usedCode) {
        msg = "Voucher has been redeemed";
        res.locals.session.usedCode = false;
    }
    else if (res.locals.session.expiredCode) {
        msg = "Voucher has expired";
        res.locals.session.expiredCode = false;
    }

    let cart = await ModelCart.findAll({
        where: {
            uuid_user: res.locals.session.userID 
        },
        raw: true
    });  
    var total = 0;
    for (let i in cart) {
        total += cart[i].price * cart[i].quantity;
    }

    //  Minus value of voucher (if used)
    if (res.locals.session.deductTotal) {
        total = total - voucher.value < 0 ? 0 : total - voucher.value;
        delete res.locals.session.deductTotal;
    }
  
    var voucherValue = voucher == undefined ? null : voucher.value;


    let custCard = await ModelCustomerCard.findAll({
        where: {
            uuid_user: res.locals.session.userID
        },
        raw: true 
    }); 
    var cardList = [];
    for (let i in custCard) {
        cardList.push(custCard[i]);
    }
    console.log("this is cardlist: ", cardList);
    return res.render('cart/checkout.html', {
        title: title,
        total: total,
        cardList: cardList, 
        user: user,
        msg: msg,
        voucherValue: voucherValue
    });
};

router.post('/addCard', urlencodedParser, async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    try {
        console.log("add card");
        await ModelCustomerCard.create({
            uuid_user  :  res.locals.session.userID,
            card_name  :  req.body.name,
            card_number:  req.body.cardNo,
            card_type  :  req.body.cardType,
            expiry 	   :  req.body.expiry,
            CVV 	   :  req.body.cvv
        });
        checkout(req, res);
    }
    catch (error) {
        //	Else internal server error
        console.error(`Failed to create a new card: ${req.body.name} `);
        console.error(error);
        return res.status(500).end();
    }
});

router.get('/deleteCard/:uuid', async (req, res) => {
    await ModelCustomerCard.destroy({
        where: {
            uuid: req.params.uuid,
        }
    });
    checkout(req, res);
});
