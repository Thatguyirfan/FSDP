import { Router } from 'express';

const router = Router();
export default router;

// ---------------- 
//	Serves dynamic files from the dynamic folder
router.get("/dynamic/*", async function (req, res) {	
    return res.sendFile(`${process.cwd()}/dynamic/${req.params[0]}`)
});

// ---------------- 
//	TODO: Attach additional routers here
import Auth from './auth.mjs';
router.use("/auth", Auth);

import Products from './products.mjs';
router.use("/products", Products);

import Cart from './cart.mjs';
router.use("/cart", Cart);

import Feedback from './feedback.mjs';
router.use("/feedback", Feedback);

import Manage from './manage.mjs';
router.use("/manage", Manage);

import Records from './records.mjs';
router.use("/records", Records);

import Users from './user.mjs';
router.use("/user", Users);

import Orders from './orders.mjs';
router.use("/orders", Orders);

// ---------------- 
//	TODO:	Common URL paths here
router.get("/", async function(req, res) {
    console.log("Home page accessed");
      const title = "HOME | DON DON DONKI";

    let popUp = false;
    // Use session for pop-up
    if (!req.session.viewCount) {
        req.session.viewCount = 1;
    }
    else {
        req.session.viewCount += 1;
        if (req.session.viewCount % 3 == 0) {
            popUp = true;
        }
    }

    return res.render('home.html', {title: title, popUp: popUp});
});

// xh
// router.get('/productView', (req,res) =>{
//   const title = "All Products | DON DON DONKI";
//   res.render('products/static_allProducts.html', {title: title});
// });

// router.get('/indivProd', async (req,res) => {
//   const title = "Indiv Products | DON DON DONKI";
//   res.render('products/individual_static.html', {title: title});
// });

// router.get('/createProduct', async (req,res) => {
//   const title = "Create Product | DON DON DONKI ADMIN";
//   res.render("products/createProduct.html", {title: title});
// });

// k
// router.get('/cart', (req,res) => {
//   const title = "Cart | DON DON DONKI";
//   res.render('cart/cart.html', {title: title});
// });

// router.get('/checkout', (req,res) => {
//   const title = "Check Out | DON DON DONKI";
//   res.render('cart/checkout.html', {title: title});
// });

// router.get('/thankyou', (req,res) => {
//   const title = "Thank You | DON DON DONKI";
//   res.render('cart/thankyou.html', {title: title});
// });
