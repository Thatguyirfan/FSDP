import { Router } from 'express';
const router = Router();
export default router;

import { config } from 'dotenv';
config();
import { createTransport } from 'nodemailer';
import { Sequelize } from 'sequelize';
import { ModelUser, UserRole } from '../data/user_model.mjs';
import { ModelFeedback } from '../data/feedback_model.mjs'; 
import { ModelVoucher } from '../data/voucher_model.mjs';
import pkg from 'sequelize';
const { Op } = pkg;
import BodyParser from 'body-parser';
var urlencodedParser = BodyParser.urlencoded({ extended: false });


// Log in to business email (send emails from this email)
// !!!!! store it in env or something !!!!!
// !!!!! change the pass when you're done !!!!!
export const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
});


// Route for feedback form
router.get("/", async (req, res) => {
    const title = "Feedback | DON DON DONKI";
    return res.render('feedback/feedback.html', {title: title});
});


// Route to insert feedback into SQL
// And display acknowledgement page
router.post('/acknowledgement', urlencodedParser, async (req, res) => {
    const title = "Acknowledgement | DON DON DONKI";

    // Check if reason is complaint
    const status = req.body.reason === "Complaint" ? true : false;

    // Create current date
    var date = new Date();
    var currdate = `${date.getFullYear()}-${`0${date.getMonth() + 1}`.slice(-2)}-${`0${date.getDate()}`.slice(-2)}`;
    var expiryDate = `${date.getFullYear()}-${`0${date.getMonth() + 4}`.slice(-2)}-${`0${date.getDate()}`.slice(-2)}`;

    try {
        // Send voucher email if first time sending feedback
        const feedback_list = await ModelFeedback.findOne({
            attributes: ['email'],
            where: {email: req.body.email}
        });

        if (feedback_list === null) {
            try {
                // Create new voucher
                const voucher = await ModelVoucher.create({
                    expiryDate: expiryDate,
                    value: 3
                });

                // Create email
                const emailMsg = {
                    from: 'dondondonki.fsdp@gmail.com',
                    to: req.body.email,
                    subject: 'Thank you for your feedback!',
                    html: '<h3>Dear valued customer,</h3>\
                    <p>We greatly appreciate your feedback and we will do what we can to improve. To show our appreciation, we would like to reward you with a <strong>SGD$' + voucher.value + ' Voucher.</strong></p>\
                    <h2>' + voucher.code + '</h2>\
                    <h4><i>*This voucher is redeemable at all outlets in Singapore.</i></h4>\
                    <p>Once again, thank you very much for the feedback.</p>\
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

            catch (error) {
                console.error("Failed to create voucher");
                console.error(error);
            }
        }

        // Store feedback in SQL
        await ModelFeedback.create({
            name      : req.body.name,
            mobile    : req.body.mobile,
            email	  : req.body.email,
            store	  : req.body.store,
            reason    : req.body.reason,
            message   : req.body.message,
            date      : currdate,
            status    : status
        });
    }

    catch (error) {
        console.error("Failed to store feedback");
        console.error(error);
    }

    return res.render('feedback/feedback_ack.html', {title: title});
});


// Route to show feedbacks
router.get("/view", async (req, res) => {
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

    const title = "View Feedback | DON DON DONKI";

    // Initialise all queries 
    const store = (req.query.store == undefined) ? "All" : req.query.store;
    const reason = (req.query.reason == undefined) ? "All" : req.query.reason;
    const page = req.query.page ? Number(req.query.page) : 1;
    var feedback_list = [];
    console.log(store);
    console.log(reason);

    try {
        // Retrieve total amount of rows in Feedback table
        feedback_list = await ModelFeedback.findAndCountAll();

        const resultsPerPage = 5;  // Number of results to display per page
        let noOfResults = feedback_list.count;
        // Calculate total number of pages that can be displayed
        let noOfPages = Math.ceil(noOfResults / resultsPerPage) == 0 ? 1 : Math.ceil(noOfResults / resultsPerPage);  

        // If page query is less than possible number of pages that can be displayed
        if (page < 1){
            return res.redirect(`/feedback/view?store=${store}&reason=${reason}&page=1`);
        }

        // If page query is larger than possible number of pages that can be displayed
        else if (page > noOfPages){
            return res.redirect(`/feedback/view/?store=${store}&reason=${reason}&page=${noOfPages}`);
        }

        else {
            const startLimit = (page - 1) * resultsPerPage;  // Calculate which row to start retrieving from
      
            // If search bar is used
            if (req.query.search !== undefined) {
                feedback_list = await ModelFeedback.findAndCountAll({
                    where: {
                        name: {[Op.like]: `%${req.query.search}%`}
                    },
                    order: [
                        ['date', 'DESC']
                    ],
                    limit: resultsPerPage,
                    offset: startLimit
                });
            }

            else {
                if (store !== "All" && reason !== "All") {
                    feedback_list = await ModelFeedback.findAndCountAll({
                        where: {
                            store: store,
                            reason: reason
                        },
                        order: [
                            ['date', 'DESC']
                        ],
                        limit: resultsPerPage,
                        offset: startLimit
                    });
                }

                else if (store === "All" && reason !== "All") {
                    feedback_list = await ModelFeedback.findAndCountAll({
                        where: {
                            reason: reason
                        },
                        order: [
                            ['date', 'DESC']
                        ],
                        limit: resultsPerPage,
                        offset: startLimit
                    });
                }

                else if (store !== "All" && reason === "All") {
                    feedback_list = await ModelFeedback.findAndCountAll({
                        where: {
                            store: store
                        },
                        order: [
                            ['date', 'DESC']
                        ],
                        limit: resultsPerPage,
                        offset: startLimit
                    });
                }

                else if (store === "All" && reason === "All") {
                    feedback_list = await ModelFeedback.findAndCountAll({
                        order: [
                            ['date', 'DESC']
                        ],
                        limit: resultsPerPage,
                        offset: startLimit
                    });
                }
            }

            // Count results and noOfPages again
            // to ensure that proper number of pages are put in the navbar
            noOfResults = feedback_list.count;
            noOfPages = Math.ceil(noOfResults / resultsPerPage);

            let iterator = (page - 2) < 1 ? 1 : page - 2;  // Used to display pages navbar in entryrecords
            // Used to display last link in pages navbar
            let endLink = (iterator + 4) <= noOfPages ? (iterator + 4) : page + (noOfPages - page);

            // If noOfPages < 5, iterator will not be subtracted
            // Because if it is negative page numbers will display
            if ((noOfPages >= 5) && (endLink < (page + 2))){
                iterator -= (page + 2) - noOfPages;
            }

      
            // Get data for graph
            var series = [];
            var reasons = ["Compliment", "Suggestion", "Complaint", "Others"];
            var compliments = [];
            var suggestions = [];
            var complaints = [];
            var others = [];

            var date = new Date();
            var currmonth = date.getMonth() + 1;  // Get current month
            var loop = currmonth - 3;  // To loop through data since 3 months ago

            while (loop < currmonth + 1) {
                for (var i in reasons) {
                    if (store === "All") {
                        var fb_list = await ModelFeedback.findAndCountAll({
                            where: {
                                reason: reasons[i],
                                date: Sequelize.where(Sequelize.fn("month", Sequelize.col("date")), loop)
                            }
                        });
                    }
                    else {
                        var fb_list = await ModelFeedback.findAndCountAll({
                            where: {
                                reason: reasons[i],
                                store: store,
                                date: Sequelize.where(Sequelize.fn("month", Sequelize.col("date")), loop)
                            }
                        });
                    }

                    // console.log(fb_list.count);
          
                    switch (i) {
                        case "0":
                            compliments.push(fb_list.count);
                            console.log("hi");
                            break;
                        case "1":
                            suggestions.push(fb_list.count);
                            break;
                        case "2":
                            complaints.push(fb_list.count);
                            break;
                        case "3":
                            others.push(fb_list.count);
                            break;
                    }
                }
                loop += 1;
            }

            series.push(compliments);
            series.push(suggestions);
            series.push(complaints);
            series.push(others);
            console.log(series);

            // Calculate percentages (compare this month and last month)
            for (var i in series) {
                var divideNo = series[i][series[i].length - 2] == 0 ? 1 : series[i][series[i].length - 2];
                var percentage = ((series[i][series[i].length -1] - series[i][series[i].length - 2]) / divideNo) * 100;
                switch (i) {
                    case "0":
                        var complimentChange = percentage;
                        break;
                    case "1":
                        var suggestionChange = percentage;
                        break;
                    case "2":
                        var complaintChange = percentage;
                        break;
                    case "3":
                        var otherChange = percentage;
                        break;
                }
            }

            // Reset replyStatus so that alert does not appear on page when refreshed
            res.locals.session.replyStatus = false;
            return res.render('manage/viewFeedback.html', {
                title: title,
                feedback_list: feedback_list.rows, 
                page: page,
                iterator: iterator,
                noOfPages: noOfPages,
                endLink: endLink,
                store: store,
                reason: reason,
                replyStatus: req.session.replyStatus,
                series: JSON.stringify(series),
                complimentChange: complimentChange, 
                suggestionChange: suggestionChange,
                complaintChange: complaintChange,
                otherChange: otherChange
            });
        }
    }

    catch (error) {
        console.error("Failed to get feedback list");
        console.error(error);
        return res.render('manage/viewFeedback.html', {title: title, feedback_list: feedback_list});
    }
});


// Route to send reply to any complaint feedbacks
// Via email
router.post('/reply', async (req, res) => {

    // Create email
    const emailMsg = {
        from: 'dondondonki.fsdp@gmail.com',
        to: req.body.email,
        subject: 'Complaint Feedback',
        text: req.body.reply
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

    // Update status attribute of feedback in SQL
    try {
        const status = await ModelFeedback.update({status: false}, {where: {uuid: req.body.uuid}});
        res.locals.session.replyStatus = true;
    }

    catch (error) {
        console.error("Failed to store entry");
        console.error(error);
    }

    return res.redirect('/feedback/view');
});

// router.get('/', async(req,res) => {
//   const title = " | DON DON DONKI";
//   res.render('', {title: title});
// });
