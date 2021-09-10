import { Router } from 'express';
const router = Router();
export default router;

import BodyParser from 'body-parser';
var urlencodedParser = BodyParser.urlencoded({ extended: false });

import Hash from 'hash.js'
import { ModelUser } from '../data/user_model.mjs'

router.get('/register', async (req, res) => {
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    return res.render('auth/register.html', {reg: true, accSuccess: accSuccess, accError: accError});
});

router.post('/register', urlencodedParser, async (req, res) => {
    var existing = await ModelUser.findOne({where: {email: req.body.email}});
    if (existing !== null) {
        res.locals.session["accError"] = "Email is already in use.";
        return res.redirect('/auth/register');
    }
    var account = await ModelUser.create({
        name: req.body.fullname,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        password: Hash.sha256().update(req.body.password).digest("hex")
    });
    res.locals.session["userID"] = account.uuid;
    res.redirect('/user/dashboard');
});

router.get('/login', async (req, res) => {
    var userID = "userID" in res.locals.session ? res.locals.session["userID"] : "";
    if (userID) {
        return res.redirect('/user/dashboard');
    }
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    return res.render('auth/login.html', {userID: userID, accSuccess: accSuccess, accError: accError});
});

router.post('/login', urlencodedParser, async (req, res) => {
    var user = await ModelUser.findOne({where: {email: req.body.email}});
    if (user === null) {
        res.locals.session["accError"] = "That account does not exist.";
        return res.redirect('/auth/login');
    }
    else {
        if (Hash.sha256().update(req.body.password).digest("hex") === user.password) {
            res.locals.session["userID"] = user.uuid;
            return res.redirect('/user/dashboard');
        }
        else {
            res.locals.session["accError"] = "The password is incorrect.";
            return res.redirect('/auth/login');
        }
    }
});

router.get('/logout', (req, res) => {
    delete res.locals.session["userID"];
    res.locals.session["accSuccess"] = "Logged out successfully!";
    return res.redirect('/auth/login');
});
