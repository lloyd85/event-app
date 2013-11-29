
/*
 * GET home page.
 */

exports.index = function(req, res){
    delete req.session.user_id;
    res.render('index', { title: 'Express' });
};

exports.login = function(req, res){
    delete req.session.user_id;
    res.render('login', { title: 'Log in' });
};

exports.loginuser = function(db, bcrypt) {
    return function(req, res) {

        var userName = req.body.username;
        var userPassword = req.body.password;
        var collection = db.get('usercollection');

        collection.findOne({username:userName}).on('success', function(doc){
            var tRes = res;
            if(doc){
                console.log('loginuser doc found')
                bcrypt.compare(userPassword, doc.password, function(err, res) {
                    if (err) console.warn(err.message);

                    if (res){
                        req.session.user_id = doc._id;
                        tRes.render('welcome', {
                            'user':doc
                        });
                        //tRes.redirect('/welcome');
                        tRes.location('/welcome');
                    }
                    else {
                        tRes.redirect('/login');
                        tRes.location('/login');
                    };
                });
            }
            else {
                console.log('Login failed because doc does not exist')
                tRes.redirect('/login');
                tRes.location('/login');
            };
        });
        collection.findOne({username:userName, email:userPassword}).on('error', function(err){
            console.warn(err.message);
        });
    };
};

exports.logout = function (req, res) {
    delete req.session.user_id;
    res.redirect('/login');
    res.location('/login');
};

exports.welcome = function (db) {
    return function(req, res){
        var user_collection = db.get('usercollection');
        var user_id;
        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){
                if (res){

                    res.render('welcome', {
                        'user':doc
                    });
                };
            }
            else {
                // tRes.redirect('/login');
                console.error('Doc user does not exist')
            };
        });
        user_collection.findOne({_id:user_id}).on('error', function(err){
            console.warn(err.message);
        });
    };
};

exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('usercollection');
        collection.find({},{},function(e,docs){
            res.render('userlist', {
                "userlist" : docs
            });
        });
    };
};

exports.newuser = function(req, res){
    res.render('newuser', { title: 'Add New User', status : ''});
};

exports.eventlist = function(db) {
    return function(req, res) {
        var user_id;
        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        var collection = db.get('eventcollection');

        collection.find({},{},function(e,docs){
            res.render('eventlist', {
                "eventlist" : docs,
                "userId": user_id
            });
        });
    };
};

exports.invite = function(db, emailTemplates, templatesDir, nodemailer) {
    return function(req, res){

        var user_collection = db.get('usercollection');
        var event_collection = db.get('eventcollection');
        var user_id, user;
        var event_id = req.params.id;
        var event;
        var invitees = req.body.collection;

        console.log('invitees\n' + invitees);

        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){
                if (res){
                    user = doc;
                    event_collection.findOne({_id:event_id}).on('success', function(doc){
                        event = doc;
                        emailTemplates(templatesDir, function(err, template) {

                            if (err) {
                                console.log('Error: ' + err);
                            } else {

                                var transportBatch = nodemailer.createTransport("SMTP", {
                                    service: "Gmail",
                                    auth: {
                                        user: "kwame.23@gmail.com",
                                        pass: "theego"
                                    }
                                });

                                var Render = function(locals) {
                                    this.locals = locals;
                                    this.send = function(err, html, text) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            transportBatch.sendMail({
                                                from: user.fname + ' at Event App Team <event-app-13@nomail.com>',
                                                to: locals.email,
                                                subject: "Invitation to " + event.name + " organised by " + user.fname,
                                                html: html,
                                                // generateTextFromHTML: true,
                                                text: text
                                            }, function(err, responseStatus) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    console.log(responseStatus.message);
                                                }
                                            });
                                        };
                                    };
                                    this.batch = function(batch) {
                                        batch(this.locals, templatesDir, this.send);
                                    };
                                };
                                template('invitation', true, function(err, batch) {
                                    for(var invitee in invitees) {
                                        var render = new Render(invitees[invitee]);
                                        render.batch(batch);
                                    };
                                    res.redirect('back');
                                });
                            };
                        });
                    });
                    event_collection.findOne({_id:event_id}).on('error', function(err){
                        console.warn(err.message);
                    });
                };
            };
        });
        user_collection.findOne({_id:user_id}).on('error', function(err){
            console.warn(err.message);
        });
    };
};

exports.newevent = function(req, res){
    res.render('newevent', { title: 'Add New Event' });
};

exports.addevent = function(db) {
    return function(req, res) {

        var user_collection = db.get('usercollection');
        var user_id;
        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){
                if (res){
                    var user = doc;
                    var eventName = req.body.name;
                    var eventInfo = req.body.info;
                    var eventStartDay = req.body.startDay;
                    var eventStartMonth = req.body.startMonth;
                    var eventStartHours = req.body.startHours;
                    var eventStartMinutes = req.body.startMinutes;
                    var eventStartYear = req.body.startYear;
                    var eventEndDay = req.body.endDay;
                    var eventEndMonth = req.body.endMonth;
                    var eventEndYear = req.body.endYear;
                    var eventEndHours = req.body.endHours;
                    var eventEndMinutes = req.body.endMinutes;
                    var eventStreet = req.body.street;
                    var eventCity = req.body.city;
                    var eventPostCode = req.body.postcode;
                    var eventCountry = req.body.country;
                    var eventSite = req.body.site;
                    var eventPhone = req.body.phone;

                    var eventObject = {
                        name : eventName,
                        info : eventInfo,

                        startDay : eventStartDay,
                        startMonth : eventStartMonth,
                        startYear : eventStartYear,

                        startHours : eventStartHours,
                        startMinutes : eventStartMinutes,    // turn this into utils function called

                        endDay : eventEndDay,
                        endMonth : eventEndMonth,
                        endYear : eventEndYear,

                        endHours : eventEndHours,
                        endMinutes : eventEndMinutes,

                        street : eventStreet,
                        city : eventCity,
                        postcode : eventPostCode,
                        country : eventCountry,

                        phone: eventPhone,
                        site : eventSite,
                        attendees : [],
                        organiser : {
                            id:user._id,
                            fname : user.fname,
                            lname : user.lname,
                            email : user.email,
                            phone : user.phone
                        }
                    };

                    var err_message = "null";
                    var collection = db.get('eventcollection');

                    function validateEventDetails(){
                        var valid = false;
                        var date = new Date();
                        var months = {
                            'Jan':1,
                            'Feb':2,
                            'Mar':3,
                            'Apr':4,
                            'May':5,
                            'Jun':6,
                            'Jul':7,
                            'Aug':8,
                            'Sep':9,
                            'Oct':10,
                            'Nov':11,
                            'Dec':12
                        };

                        var currentDay = date.getDate();
                        var currentMonth = (date.getMonth()+1);
                        var currentYear = date.getFullYear();
                        var currentHours = date.getHours();
                        var currentMinutes = (date.getMinutes < 10) ? '0' + date.getMinutes() : date.getMinutes();

                        if(eventName.length < 1 || eventInfo.length < 1 || eventPostCode.length < 1){
                            err_message = 'Please enter valid event name and info';
                        }
                        else if (eventStartYear < currentYear){
                            err_message = 'The start year has already passed';
                        }
                        else if (eventStartYear == currentYear && months[eventStartMonth] < currentMonth){

                            err_message = 'The start month has already passed';
                        }
                        else if (eventStartDay < currentDay && months[eventStartMonth] == currentMonth && eventStartYear == currentYear){
                            err_message = 'The start date has already passed';
                        }
                        else if (eventStartDay == currentDay && months[eventStartMonth] == currentMonth && eventStartYear == currentYear){
                            if(eventStartHours < currentHours){
                                err_message = 'Please make sure that the time for the Start is not earlier than the current time (hours)';
                            }
                            else if(eventStartHours == currentHours && eventStartMinutes < currentMinutes){
                                err_message = 'Please make sure that the time for the Start is not earlier than the current time (minutes)';
                            }
                            else {
                                if(eventEndYear < eventStartYear){
                                    err_message = 'Please make sure that the end year is not earlier than the start year';
                                }
                                else if (eventEndYear == eventStartYear && months[eventEndMonth] < months[eventStartMonth]){
                                    err_message = 'Please make sure that the end month is not earlier than the start month';
                                }
                                else if (eventEndDay < eventStartDay){
                                    err_message = 'Please make sure that the end date is not earlier than the start date';
                                }
                                else if (eventEndDay == eventStartDay && months[eventEndMonth] == months[eventStartMonth] && eventEndYear == eventStartYear){
                                    if(eventEndHours < eventStartHours){
                                        err_message = 'Please make sure that the time for the end is not earlier than the start time (hours)';
                                    }
                                    else if(eventEndHours == eventStartHours && eventEndMinutes <= eventStartMinutes){
                                        err_message = 'Please make sure that the time for the end is not earlier than the start time (minutes)';
                                    };
                                };
                            };
                        } else {
                            valid = true;
                        };

                        return valid;
                    };

                    if(validateEventDetails()){
                        collection.insert(eventObject, function (err, doc) {
                            if (err) {
                                res.send("There was a problem adding the information to the database.");
                            }
                            else {
                                res.redirect('/eventlist');
                                res.location('/eventlist');
                            };
                        });
                    } else {
                        console.log('Something is wrong: ' + err_message);
                        res.location('/newevent');
                        res.render('newevent', { title: 'Add New User', status : err_message});

                    };
                };
            };
        });
    };
};

exports.deleteevent = function(db) {
    return function(req, res) {
        console.log('Event should be deleted');
        var event_collection = db.get('eventcollection');
        var event_id = req.params.id;

        event_collection.remove({_id:event_id}, function(err, removed){
            if (err) {
                res.send("There was a problem adding the information to the database.");
            }
            else {
                console.log(removed);
                res.redirect('/eventlist');
                res.location('/eventlist');
            };
        });
    };
};

exports.updateevent = function(db) {
    return function(req, res) {
        console.log('Event should be updated');
        var event_collection = db.get('eventcollection');
        var event_id = req.params.id;
        var eventObject = req.body;
        console.log(eventObject);

        event_collection.update({_id:event_id},
            {
                $set: eventObject
            }, function(err, docs){
                if (err) {
                    res.send("There was a problem adding the information to the database.");
                }
                else {
                    console.log('This should be it: \n' + docs);
                  //  res.redirect('/eventlist');
                 //   res.location('/eventlist');
                };
            }
        );
    };
};

exports.adduser = function(db, bcrypt) {
    return function(req, res) {

        // Get our form values. These rely on the "name" attributes
        var userName = req.body.username;
        var userFirstName = req.body.fname;
        var userLastName = req.body.lname;
        var userEmail = req.body.email;
        var userPhone = req.body.phone;
        var userPassword = req.body.password;
        var userConfirmPassword = validatePassword(req.body.conf_password);
        // Set our collection
        var collection = db.get('usercollection');
        var userNameValid = validateUserName(userName);
        var userEmailValid = validateEmail(userEmail);
        var userPhoneValid = validatePhone(userPhone);

        function checkPropertyExistence(collection, key, value, callback) {
            var obj = new Object();
            obj[key] = value;
            collection.find(obj,{},function(e,docs){
                if (e) console.warn(e.message);

                for(var i = 0, len = docs.length; i < len; i++) {
                    console.log('Username Value: ' + docs[i][key]);
                    if(docs[i][key] == value) {
                        console.log('Property Key ' + key + ' already exists');
                        callback.apply(this);
                        break;
                    };
                };
            });
        };

        function validatePassword(userConfirmPassword){
            console.log('userPassword ' + userPassword);
            console.log('userConfirmPassword ' + userConfirmPassword);

            if( userPassword == userConfirmPassword){

                console.log(userPassword.length);
                if(userPassword.length < 9 && userPassword.length > 4){
                    encryptPassword(userPassword);
                }
                else {
                    console.error('Password too short/long make sure its btw 5 - 8 chars lng');
                };
            }
            else {
                console.error('Password dont match');
            };
        };

        function validateEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };

        function validatePhone(phoneNumber){
            var re = /(00\d+\s*|\+\d+\s*|0\s*)(\d+\s*)*(\/)\s*(\d+\s*)*/g;
            return true;//re.test(phoneNumber);
        };

        function validateUserName(username){
            var tUserNameValid = false;
            if(userName.length < 10 && userName.length > 4){
                console.log('username has right length');
                console.log('Collection: ' + collection);
                tUserNameValid = true;
                checkPropertyExistence(collection, 'username', username, function(){
                    console.log('Property Key already exists');
                    res.redirect('/newuser');
                    res.location('/newuser');
                    userNameValid = false;
                });
            } else {
                console.error('Make sure your username is between 6 - 10 Characters');
            };
            return tUserNameValid;
        };

        function encryptPassword(userPassword){
            var tHash;
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userPassword, salt, function(err, hash) {
                    // Store hash in your password DB.
                    if (err) console.warn(err.message);

                    tHash = hash;
                    saveDetails({
                        "fname" : userFirstName,
                        "lname" : userLastName,
                        "email" : userEmail,
                        "phone" : userPhone,
                        "username" : userName,
                        "password" : tHash
                    });
                });
            });
        };

        // Submit to the DB
        function saveDetails(detailsObject){

            console.log('Saving Details Func');
            console.log('userNameValid : ' + userNameValid);
            console.log('userEmailValid : ' + userEmailValid);
            console.log('userPhoneValid : ' + userPhoneValid);

            if(userNameValid && userEmailValid && userPhoneValid) {

                console.log('Saving Details Func - Success');
                collection.insert(detailsObject, function (err, doc) {
                    if (err) {
                        res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        res.redirect('/login');
                        res.location('/login');
                    };
                });
            };
        };
    };
}

exports.subscribe = function(db, emailTemplates, templatesDir, nodemailer){
    return function(req, res){
        var user_collection = db.get('usercollection');
        var event_collection = db.get('eventcollection');
        var user_id;
        var user;
        var event_id = req.params.id;
        var attendee;
        if (req.session.user_id){
            user_id = req.session.user_id;
        };
        console.log('subscrible init');
        user_collection.findOne({_id:user_id}).on('success', function(doc){
            console.log('User for subscription found')
            if(doc){

                user = doc
                if (res){

                    attendee = {
                        id:user._id,
                        fname:user.fname,
                        lname:user.lname,
                        email:user.email
                    }
                    console.log(JSON.stringify(attendee))
                    event_collection.update({_id:event_id},
                        {
                            $addToSet: {attendees: attendee}
                        }, function(err, docs){
                            if (err) {
                                res.send("There was a problem adding the information to the database.");
                            }
                            else {
                                console.log('This should be it: \n' + docs);
                                //res.render('/eventlist', {layout:false});
                                //res.location('/eventlist');
                                //res.redirect('/eventlist');

                                retStatus = 'Success';
                                // res.redirect('/team');
                                res.send({
                                    retStatus : retStatus,
                                    redirectTo: '/eventlist',
                                    msg : 'Just go there please' // this should help
                                });/**/

                                /*emailTemplates(templatesDir, function(err, template) {

                                    if (err) {
                                        console.log('Error: ' + err);
                                    } else {

                                        // ## Send a batch of emails and only load the template once

                                        // Prepare nodemailer transport object
                                        var transportBatch = nodemailer.createTransport("SMTP", {
                                            service: "Gmail",
                                            auth: {
                                                user: "kwame.23@gmail.com",
                                                pass: "theego"
                                            }
                                        });

                                        var Render = function(locals) {
                                            this.locals = locals;
                                            this.send = function(err, html, text) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    transportBatch.sendMail({
                                                        from: 'Event App Team <event-app-13@nomail.com>',
                                                        to: locals.email,
                                                        subject: "Update to " + docs.name + " organised by " + user.name,
                                                        html: html,
                                                        // generateTextFromHTML: true,
                                                        text: text
                                                    }, function(err, responseStatus) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log(responseStatus.message);
                                                        };
                                                    });
                                                };
                                            };
                                            this.batch = function(batch) {
                                                batch(this.locals, templatesDir, this.send);
                                            };
                                        };

                                        // Load the template and send the emails
                                        template('update_subscribe', true, function(err, batch) {
                                            for(var attendee in docs.attendees) {
                                                var render = new Render(docs.attendees[attendee]);
                                                render.batch(batch);
                                            };
                                        });
                                    };
                                });*/
                            };
                        }
                    );
                };
            };
        });
    };
};

exports.unsubscribe = function(db, emailTemplates, templatesDir, nodemailer){
    return function(req, res){
        var user_collection = db.get('usercollection');
        var event_collection = db.get('eventcollection');
        var user_id;
        var user;
        var attendee;
        var event_id = req.params.id;
        if (req.session.user_id){
            user_id = req.session.user_id;
        };
        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){

                user = doc;
                if (res){

                    attendee = {
                        id:user._id,
                        fname:user.fname,
                        lname:user.lname,
                        email:user.email
                    }
                    event_collection.update({_id:event_id},
                        {
                           $pull: {attendees: attendee}
                        }, function(err, docs){
                            if (err) {
                                res.send("There was a problem adding the information to the database.");
                            }
                            else {
                                console.log('This should be unsubscribed: \n' + docs);
                                //res.redirect('/eventlist');
                                //res.location('/eventlist');

                                retStatus = 'Success';
                                // res.redirect('/team');
                                res.send({
                                    retStatus : retStatus,
                                    redirectTo: '/eventlist',
                                    msg : 'Just go there please' // this should help
                                });/**/

                                /*emailTemplates(templatesDir, function(err, template) {

                                    if (err) {
                                        console.log('Error: ' + err);
                                    } else {

                                        // ## Send a batch of emails and only load the template once

                                        // Prepare nodemailer transport object
                                        var transportBatch = nodemailer.createTransport("SMTP", {
                                            service: "Gmail",
                                            auth: {
                                                user: "kwame.23@gmail.com",
                                                pass: "theego"
                                            }
                                        });

                                        var Render = function(locals) {
                                            this.locals = locals;
                                            this.send = function(err, html, text) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    transportBatch.sendMail({
                                                        from: 'Event App Team <event-app-13@nomail.com>',
                                                        to: locals.email,
                                                        subject: "Update to " + docs.name + " organised by " + user.name,
                                                        html: html,
                                                        //generateTextFromHTML: true,
                                                        text: text
                                                    },  function(err, responseStatus) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log(responseStatus.message);
                                                        };
                                                    });
                                                };
                                            };
                                            this.batch = function(batch) {
                                                batch(this.locals, templatesDir, this.send);
                                            };
                                        };

                                        // Load the template and send the emails
                                        template('update_unsubscribe', true, function(err, batch) {
                                            for(var attendee in docs.attendees) {
                                                var render = new Render(docs.attendees[attendee]);
                                                render.batch(batch);
                                            };
                                        });
                                    };
                                });*/
                            };
                        }
                    );
                };
            };
        });
        user_collection.findOne({_id:user_id}).on('error', function(err){
            console.warn(err.message);
        });
    };
};

exports.deleteattendee = function(db, emailTemplates, templatesDir, nodemailer){
    return function(req, res){
        var user_collection = db.get('usercollection');
        var event_collection = db.get('eventcollection');
        var user_id;
        var user;
        var event_id = req.params.id;
        var attendee_id = req.params.attendee_id;
        if (req.session.user_id){
            user_id = req.session.user_id;
        };
        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){
                user = doc;
                if (res){

                    event_collection.remove({_id:event_id ,'attendees.id': attendee_id },
                        function(err, docs){
                            if (err) {
                                res.send("There was a problem removing the attendee to the database.");
                            }
                            else {
                                console.log('This should be it: \n' + docs);

                                //  res.redirect('/eventlist');
                                //   res.location('/eventlist');

                                emailTemplates(templatesDir, function(err, template) {

                                    if (err) {
                                        console.log('Error: ' + err);
                                    } else {

                                        // ## Send a batch of emails and only load the template once

                                        // Prepare nodemailer transport object
                                        var transportBatch = nodemailer.createTransport("SMTP", {
                                            service: "Gmail",
                                            auth: {
                                                user: "kwame.23@gmail.com",
                                                pass: "theego"
                                            }
                                        });

                                        var Render = function(locals) {
                                            this.locals = locals;
                                            this.send = function(err, html, text) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    transportBatch.sendMail({
                                                        from: 'Event App Team <event-app-13@nomail.com>',
                                                        to: locals.email,
                                                        subject: "Update to " + docs.name + " organised by " + user.name,
                                                        html: html,
                                                        // generateTextFromHTML: true,
                                                        text: text
                                                    }, function(err, responseStatus) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log(responseStatus.message);
                                                        };
                                                    });
                                                };
                                            };
                                            this.batch = function(batch) {
                                                batch(this.locals, templatesDir, this.send);
                                            };
                                        };

                                        // Load the template and send the emails
                                        template('update_delete', true, function(err, batch) {
                                            for(var attendee in docs.attendees) {
                                                var render = new Render(docs.attendees[attendee]);
                                                render.batch(batch);
                                            };
                                        });
                                    };
                                });
                            };
                        }
                    );
                };
            };
        });
    };
};