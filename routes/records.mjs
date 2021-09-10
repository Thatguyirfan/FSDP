import { Router } from 'express';
const router = Router();
export default router;

import { ModelEntry } from '../data/entry_model.mjs';
import { UserRole, ModelUser } from '../data/user_model.mjs';
import pkg from 'sequelize';
const { Op } = pkg;
import BodyParser from 'body-parser';
var urlencodedParser = BodyParser.urlencoded({ extended: false });


// Route to entry form
router.get("/storeentry", async (req, res) => {
    const title = "Store Entry | DON DON DONKI";

    // If customer has already done store entry, route back to store exit page
    if (res.locals.session.inStore === true) {
        const entry = await ModelEntry.findOne({
            where: {
                uuid: res.locals.session.uuid
            }
        });
        
        return res.render('records/storeexit.html', {
            title: title,
            date: res.locals.session.entryDate,
            entrytime: res.locals.session.entryTime,
            store: entry.store
        });
    }

    // Used to display alert in html based on true or false
    var validTime = res.locals.session.validTime === undefined ? true : res.locals.session.validTime;

    res.render('records/storeentry.html', {title: title, validTime: validTime});

    // Reset the req.session.validTime so that alert does not appear in html
    res.locals.session.validTime = true;
});


// Route to insert entry data into SQL
// And display store entry details
router.post("/storeexit", urlencodedParser, async (req, res) => {
    const title = "Store Entry Details | DON DON DONKI";

    const store = req.body.store;
    res.locals.session.validTime = true;  // Used to display alert in html based on true or false
    res.locals.session.inStore = true;  // Used to route user back to this route if they have already done the store entry form


    // Check if store entry is within the store's operating hours
    let storeOpening = 0;
    let storeClosing = 0;

    switch (store) {
        case "100AM":
        case "Square 2":
            storeOpening = 9;
            storeClosing = 23;
            break;
        case "City Square Mall":
        case "Jem":
            storeOpening = 9;
            break;
        case "JCube":
        case "HarbourFront Centre":
            storeOpening = 10;
            storeClosing = 23;
            break;
        case "Clarke Quay Central":
            storeOpening = 10;
            break;
    }

    const parsedTime = parseInt(req.body.time.slice(0, 2));

    if (parsedTime < storeOpening || (storeClosing !== 0 && parsedTime >= storeClosing)) {
        res.locals.session.validTime = true;
    }

    // If entry time is not valid, redirect to form and display alert
    if (!res.locals.session.validTime)
    {
        return res.redirect("/records/storeentry");
    }

    // Create entry
    try {
        const entry = await ModelEntry.create({
            store: store,
            date: req.body.date,
            entrytime: req.body.time,
            nric: req.body.nric.toUpperCase(),
            temperature: req.body.temperature,
            mobile: req.body.mobile,
            exittime: ""
        });

        // Put uuid into a session variable so it can be used to update a specific entry
        res.locals.session.uuid = entry.uuid;
        // Put date and time into a session variable so it can display in store exit page
        res.locals.session.entryDate = req.body.date;
        res.locals.session.entryTime = req.body.time;

        return res.render('records/storeexit.html', {
            title: title,
            date: req.body.date,
            entrytime: req.body.time,
            store: store
        });
    }

    catch (error) {
        console.error("Failed to store entry");
        console.error(error);
    }
});


// Route to update exittime in a specific entry
router.post("/storeentrydetails", urlencodedParser, async (req, res) => {
    // Set time for exittime
    var curDate = new Date();
    var time = `${`0${curDate.getHours()}`.slice(-2)}:${`0${curDate.getMinutes()}`.slice(-2)}`;
    const uuid = res.locals.session.uuid;
    delete res.locals.session.uuid;
    delete res.locals.session.entryDate;
    delete res.locals.session.inStore;
    delete res.locals.session.entryTime;

    // Update exittime for specific uuid
    try {
        const entry = await ModelEntry.update({exittime: time}, {where: {uuid: uuid}});
    }

    catch (error) {
        console.error("Failed to update entry");
        console.error(error);
    }

    return res.redirect("/");
});


// Route to display storecount form
router.get("/storecount", async (req, res) => {
    const title = "Store Count | DON DON DONKI";

    return res.render('records/storecount.html', {title: title});
});


// Route to calculate data for graph
// And display graph
router.post('/showstorecount', async(req,res) => {
    const title = "Store Count | DON DON DONKI";

    // Initialise dictioary to store 
    // time (in hours) as key and
    // average number of customers per week as value
    const time_dict = {};

    const list = await ModelEntry.findAll({where: {store: req.body.store}});

    for (var i=0; i < 25; i++) {
        var count = 0;
        var weeks = 0;
        var check_date = '';

        for (var j in list) {
            var date = list[j]["date"];
            var d = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            if (date.getDay() == Number(req.body.day)) {
                var time = list[j]["entrytime"].slice(0, 2);
                if (parseInt(time, 10) == i) {
                    count++;
                    if (d != check_date) {
                        weeks++;
                        check_date = d;
                    }
                }
            }
        }

        if (weeks === 0) {
            time_dict[i] = count;
        }
        else {
            var avg_count = count / weeks;
            time_dict[i] = avg_count;
        }
    }

    var labels = [];  // values of bars in chart
    var series = [];  // x-axis labels
    for (var i in time_dict) {
        labels.push(i);
        series.push(time_dict[i]);
    }

    console.log(labels);
    console.log(series);

    return res.render('records/showstorecount.html', {
        title: title,
        count_list: JSON.stringify(series),
        time_list: JSON.stringify(labels), 
        store: req.body.store
    });
});


// Route to display entry records
router.get('/entries', async (req, res) => {
    const title = " Entry Records | DON DON DONKI";

    // If false, set store to the default store that the employee is working at
    // const store = smtg(req.query.store) ? req.query.store : default;

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
    if (user.role === UserRole.User) {
        return res.redirect('/user/dashboard');
    }

    // Managers can select which store to display
    // while employees can only see entry records from their working location
    let store = '';
    if (user.role === UserRole.Employee) {
        store = user.workingLocation;
    }

    else if (user.role === UserRole.Manager) {
        store = req.query.store === undefined ? "Orchard Central" : req.query.store;
    }

    // Initialise all queries
    const page = req.query.page ? Number(req.query.page) : 1;

    try {
        var entry_list = [];
        entry_list = await ModelEntry.findAndCountAll();  // Retrieve total amount of rows in Feedback table

        const resultsPerPage = 2;  // Number of results to display per page
        let noOfResults = entry_list.count;
        // Calculate total number of pages that can be displayed
        let noOfPages = Math.ceil(noOfResults / resultsPerPage) === 0 ? 1 : Math.ceil(noOfResults / resultsPerPage);
        // If page query is larger than possible number of pages that can be displayed
        if (page > noOfPages){
            return res.redirect(`/records/entries/?store=${store}&page=${noOfPages}`);
        }
        // If page query is less than possible number of pages that can be displayed
        else if (page < 1) {
            return res.redirect(`/records/entries/?store=${store}&page=1`);
        }
        else {
            const startLimit = (page - 1) * resultsPerPage; // Calculate which row to start retrieving from

            // If search bar is used
            if (req.query.search !== undefined) {
                entry_list = await ModelEntry.findAndCountAll({
                    where: {
                        nric: {
                            [Op.like]: `%${req.query.search}%`
                        }
                    },
                    order: [
                        ['date', 'DESC'],
                        ['entrytime', 'DESC']
                    ],
                    limit: resultsPerPage,
                    offset: startLimit
                });
            }

            else {
                entry_list = await ModelEntry.findAndCountAll({
                    where: {
                        store: store
                    },
                    order: [
                        ['date', 'DESC'],
                        ['entrytime', 'DESC']
                    ],
                    limit: resultsPerPage,
                    offset: startLimit
                });
        }

            // Count results and noOfPages again
            // to ensure that proper number of pages are put in the navbar
            noOfResults = entry_list.count;
            noOfPages = Math.ceil(noOfResults / resultsPerPage);

            let iterator = (page - 2) < 1 ? 1 : page - 2;  // Used to display pages navbar in entryrecords
            // Used to display last link in pages navbar
            let endLink = (iterator + 4) <= noOfPages ? (iterator + 4) : page + (noOfPages - page);

            // If noOfPages < 5, iterator will not be subtracted
            // Because if it is negative page numbers will display
            if ((noOfPages >= 5) && (endLink < (page + 2))){
                iterator -= (page + 2) - noOfPages;
            }

            console.log(user.role);

            return res.render('records/entryrecords.html', {
                title: title,
                entry_list: entry_list.rows, 
                page: page,
                iterator: iterator,
                noOfPages: noOfPages,
                endLink: endLink, 
                store: store,
                user_role: user.role
            });
        }
    }

    catch (error) {
        console.error("Failed to get entry list");
        console.error(error);
        return res.render('records/entryrecords.html', {title: title, entry_list: entry_list});
    }

});

// router.get('/', async(req,res) => {
//   const title = " | DON DON DONKI";
//   res.render('', {title: title});
// });
