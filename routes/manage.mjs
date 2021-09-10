import { Router } from 'express';
const router = Router();
export default router;

import { ModelUser, UserRole } from '../data/user_model.mjs';

import Hash from 'Hash.js';
import BodyParser from 'body-parser';
var urlencodedParser = BodyParser.urlencoded({ extended: false });

router.get('/manageaccounts', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var userUpdated = "userUpdated" in res.locals.session ? res.locals.session["userUpdated"] : "";
    var userDeleted = "userDeleted" in res.locals.session ? res.locals.session["userDeleted"] : "";
    delete res.locals.session["userUpdated"];
    delete res.locals.session["userDeleted"];
    let users = await ModelUser.findAll({
        where: {
            role: UserRole.User
        }
    });
    return res.render('manage/manageusers.html', {userUpdated: userUpdated, userDeleted: userDeleted, users: users});
});

router.get('/manageemployees', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var userUpdated = "userUpdated" in res.locals.session ? res.locals.session["userUpdated"] : "";
    var userDeleted = "userDeleted" in res.locals.session ? res.locals.session["userDeleted"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["userUpdated"];
    delete res.locals.session["userDeleted"];
    let users = await ModelUser.findAll({
        where: {
            role: UserRole.Employee
        }
    });
    return res.render('manage/manageemployees.html', {accSuccess: accSuccess, userUpdated: userUpdated, userDeleted: userDeleted, users: users});
});

router.get('/createemployee', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    return res.render('auth/register.html', {reg: false, accSuccess: accSuccess, accError: accError});
});

router.post('/createemployee', urlencodedParser, async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var existing = await ModelUser.findOne({where: {email: req.body.email}});
    if (existing !== null) {
        res.locals.session["accError"] = "Email is already in use.";
        return res.redirect('/manage/createemployee');
    }
    var account = await ModelUser.create({
        name: req.body.fullname,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        salary: req.body.salary,
        workingLocation: req.body.workinglocation,
        role: UserRole.Employee,
        title: "Employee",
        password: Hash.sha256().update(req.body.password).digest("hex")
    });
    res.locals.session["accSuccess"] = "Successfully created " + account.name + "!";
    return res.redirect('/manage/manageemployees');
});

router.get('/updateschedule/:id', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var editingUser = await ModelUser.findOne({where: {uuid: req.params.id}})
    if (editingUser === null) {
        return res.redirect('/manage/manageaccounts');
    }
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    let schedule;
    if (editingUser.schedule === "{}") {
        let emptyArray = new Array(10).fill("", 0, 10);
        editingUser.schedule = schedule = JSON.stringify({
            "Monday": emptyArray,
            "Tuesday": emptyArray,
            "Wednesday": emptyArray,
            "Thursday": emptyArray,
            "Friday": emptyArray
        });
        await editingUser.save();
    }
    else {
        schedule = editingUser.schedule;
    }
    schedule = JSON.parse(schedule);
    return res.render('manage/editschedule.html', {schedule: schedule, accSuccess: accSuccess, accError: accError});
});

router.post('/updateschedule/:id', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var editingUser = await ModelUser.findOne({where: {uuid: req.params.id}})
    if (editingUser === null) {
        return res.redirect('/manage/manageaccounts');
    }
    let schedule = {};
    Object.keys(req.body).forEach(key => {
        let day = key.split("_")[0];
        let index = parseInt(key.split("_")[1]);
        if (!(day in schedule)) {
            schedule[day] = new Array(10).fill("", 0, 10);
        }
        schedule[day][index] = req.body[key];
    });
    editingUser.schedule = JSON.stringify(schedule);
    await editingUser.save();
    res.locals.session["accSuccess"] = "Schedule updated successfully!";
    return res.redirect("/manage/updateschedule/" + req.params.id);
});

router.get('/updateaccount/:id', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var editingUser = await ModelUser.findOne({where: {uuid: req.params.id}})
    if (editingUser === null) {
        return res.redirect('/manage/manageaccounts');
    }
    var accSuccess = "accSuccess" in res.locals.session ? res.locals.session["accSuccess"] : "";
    var accError = "accError" in res.locals.session ? res.locals.session["accError"] : "";
    delete res.locals.session["accSuccess"];
    delete res.locals.session["accError"];
    return res.render('user/editprofile.html', {user: editingUser, accSuccess: accSuccess, accError: accError, reg: false, emp: editingUser.role === UserRole.Employee});
});

router.post('/updateaccount/:id', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var editingUser = await ModelUser.findOne({where: {uuid: req.params.id}});
    editingUser.name = req.body.fullname;
    editingUser.address = req.body.address;
    editingUser.phone = req.body.phone;
    await editingUser.save();
    res.locals.session["accSuccess"] = "Successfully updated account!";
    return res.redirect('/manage/updateaccount/' + req.params.id);
});

router.get('/deleteaccount/:id', async (req, res) => {
    if (!("userID" in res.locals.session)) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    var user = await ModelUser.findOne({where: {uuid: res.locals.session.userID}});
    if (user === null) {
        res.locals.session["accError"] = "You need to be signed in to access that.";
        return res.redirect('/auth/login');
    }
    if (user.role !== UserRole.Manager) {
        return res.redirect('/user/dashboard');
    }
    var editingUser = await ModelUser.findOne({where: {uuid: req.params.id}})
    if (editingUser === null) {
        return res.redirect('/manage/manageaccounts');
    }
    await editingUser.destroy();
    res.locals.session["userDeleted"] = "Successfully deleted the account!";
    return res.redirect('/manage/manageaccounts');
});
