import { Router } from 'express';
const router = Router();
export default router;

import Hash   from 'hash.js'
import BodyParser from 'body-parser';
var urlencodedParser = BodyParser.urlencoded({ extended: false });

import { transporter } from './feedback.mjs';
import { ModelOrderDetails } from '../data/orderDetails_model.mjs';
import { ModelUser } from '../data/user_model.mjs';
import { UserRole } from '../data/user_model.mjs';

let passwordResets = {};

router.get('/forgotpassword', (req, res) => {
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    return res.render('user/forgotpassword.html', {accSuccess: accSuccess, accError: accError});
});

router.post('/forgotpassword', async (req, res) => {
    var user = await ModelUser.findOne({where: {email: req.body.email}});
    if (user !== null) {
        let uniqueKey = Hash.sha256().update(Date.now()).digest("hex");
        passwordResets[uniqueKey] = user.uuid;
        let uniqueLink = `http://${req.headers.host}/user/passwordreset/${uniqueKey}`;
        const emailMsg = {
            from: 'dondondonki.fsdp@gmail.com',
            to: req.body.email,
            subject: 'Password Reset Link',
            html: '<h3>Hi ' + user.name + ',</h3>\
            <p>You recently requested a password reset. Please click on the link below to proceed, or ignore this email if you didn\'t request it.</p>\
            <p>' + uniqueLink + '</p>\
            <p>Yours truly,</p>\
            <h3>DONDONDONKI Team</h3>'
        };
        // Send email
        transporter.sendMail(emailMsg, function(error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    res.locals.session["accSuccess"] = "Password reset link will be sent to your email if it exists";
    return res.redirect('/user/forgotpassword');
})

router.get('/passwordreset/:key', async (req, res) => {
    if (!(req.params.key in passwordResets)) {
        res.locals.session["accError"] = "Invalid password reset key!";
        return res.redirect('/auth/login');
    }
    let userId = passwordResets[req.params.key];
    var user = await ModelUser.findOne({where: {uuid: userId}});
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    return res.render('user/passwordreset.html', {accSuccess: accSuccess, accError: accError, user: user});
});

router.post('/passwordreset/:key', async (req, res) => {
    if (!(req.params.key in passwordResets)) {
        res.locals.session["accError"] = "Invalid password reset key!";
        return res.redirect('/auth/login');
    }
    if (req.body.new_password !== req.body.confirm_password) {
        res.locals.session["accError"] = "The new password does not match!";
        return res.redirect('/user/passwordreset/' + req.params.key);
    }
    let userId = passwordResets[req.params.key];
    var user = await ModelUser.findOne({where: {uuid: userId}});
    user.password = Hash.sha256().update(req.body.new_password).digest("hex");
    await user.save();
    res.locals.session["accSuccess"] = "Your password has been reset successfully!";
    delete passwordResets[req.params.key];
    return res.redirect('/auth/login');
});

router.get('/deleteself', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    await user.destroy();
    delete res.locals.session["userID"];
    res.locals.session["accSuccess"] = "Successfully deleted your account!";
    return res.redirect('/auth/login');
});

router.get('/editprofile', async (req, res) => {
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    return res.render('user/editprofile.html', {user: user, accSuccess: accSuccess, accError: accError, reg: true});
});

router.post('/editprofile', async (req, res) => {
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    user.name = req.body.fullname;
    user.address = req.body.address;
    user.phone = req.body.phone;
    await user.save();
    res.locals.session["accSuccess"] = "Successfully updated your profile!";
    return res.redirect('/user/editprofile');
});

router.get('/dashboard', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    let ordersToShip = await ModelOrderDetails.findAll({
        where: {
            uuid_user: res.locals.session.userID,
            delivery_status: "PACKING"
        },
        raw: true
    });
    let ordersToReceive = await ModelOrderDetails.findAll({
        where: {
          uuid_user: res.locals.session.userID,
          delivery_status: "OTW"
        },
        raw: true 
    });
    let ordersComp = await ModelOrderDetails.findAll({
        where: {
            uuid_user: res.locals.session.userID,
            delivery_status: "COMPLETED"
        },
        raw: true
    });
    let orderSummary = `${ordersToShip.length > 0 ? `${ordersToShip.length} preparing, ` : ""}${ordersToReceive.length > 0 ? `${ordersToReceive.length} on the way, ` : ""}${ordersComp.length} completed`;
    let schedule = "{}";
    if (user.role === UserRole.Employee) {
        schedule = JSON.parse(user.schedule);
    }
    return res.render('user/dashboard.html', {user: user, orderSummary: orderSummary, schedule: schedule});
});

router.get('/changepassword', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    return res.render('user/changepassword.html', {accSuccess: accSuccess, accError: accError});
});

router.post('/changepassword', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (Hash.sha256().update(req.body.current_password).digest("hex") === user.password) {
        if (req.body.new_password !== req.body.confirm_password) {
            res.locals.session["accError"] = "The new password does not match.";
            return res.redirect('/user/changepassword');
        }
        user.password = Hash.sha256().update(req.body.new_password).digest("hex");
        await user.save();
        res.locals.session["accSuccess"] = "Password changed successfully.";
        return res.redirect('/user/changepassword');
    }
    else {
        res.locals.session["accError"] = "The current password is incorrect.";
        return res.redirect('/user/changepassword');
    }
});
