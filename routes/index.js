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
                bcrypt.compare(userPassword, doc.password, function(err, res) {
                    if (err) console.warn(err.message);

                    if (res){
                        req.session.user_id = doc._id;
                        tRes.redirect('/welcome');
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
    res.redirect('/welcome');
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
                console.error('Doc user does not exist')
            };
        });
        user_collection.findOne({_id:user_id}).on('error', function(err){
            console.warn(err.message);
        });
    };
};

exports.mydetails = function (db) {
    return function(req, res){
        var user_collection = db.get('usercollection');
        var user_id;

        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){
                if (res){

                    res.render('mydetails', {
                        'user':doc
                    });
                };
            }
            else {
                console.error('Doc user does not exist')
            };
        });
        user_collection.findOne({_id:user_id}).on('error', function(err){
            console.warn(err.message);
        });
    };
};

exports.updatemydetails = function(db) {
    return function(req, res) {
        console.log('Profile should be updated');
        var user_collection = db.get('usercollection');
        var user_id, userObject = req.body;

        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        console.log('User Object: ' + JSON.stringify(userObject));
        console.log('User Object: ' + JSON.stringify(userObject));
        console.log('Event ID: ' + user_id )
        user_collection.update({_id:user_id},
            {
                $set: userObject
            }, function(err, docs){
                if (err) {
                    res.send("There was a problem adding the information to the database.");
                }
                else {
                    console.log('This should be it: \n' + docs);
                };
            }
        );
    };
};


exports.deletemydetails = function(db) {
    return function(req, res) {
        console.log('Profile should be deleted');
        var user_collection = db.get('usercollection');
        var user_id;

        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        user_collection.remove({_id:user_id}, function(err, removed){
            if (err) {
                res.send("There was a problem removing your profile the information to the database.");
            }
            else {
                retStatus = 'Success';
                res.send({
                    retStatus : retStatus,
                    redirectTo: '/'
                });
            };
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

exports.myevents = function(db) {
    return function(req, res) {
        var user_collection = db.get('usercollection');
        var event_collection = db.get('eventcollection');
        var user_id, user;

        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){
                if (res){
                    user = doc;
                    event_collection.find({'organiser.id':user._id},function(e,docs){
                        res.render('myevents', {
                            "eventlist" : docs,
                            "user" : user
                        });
                    });
                };
            };
        });
    };
};

exports.events = function(db) {
    return function(req, res) {
        var user_collection = db.get('usercollection');
        var event_collection = db.get('eventcollection');
        var event_id, event;
        var user_id, user;

        if (req.session.user_id){
            user_id = req.session.user_id;
        };

        user_collection.findOne({_id:user_id}).on('success', function(doc){

            if(doc){
                if (res){
                    user = doc;
                    event_collection.find({'attendees.id':user._id},{},function(e,docs){
                        res.render('events', {
                            "eventlist" : docs,
                            "userId": user._id
                        });
                    });
                };
            };
        });
    };
};

exports.event = function (db) {
    return function(req, res){
        var event_collection = db.get('eventcollection');
        var event_id = req.params.id;

        event_collection.findOne({_id:event_id}).on('success', function(doc){

            if(doc){
                if (res){

                    res.render('event', {
                        'event':doc
                    });
                };
            }
        });
        event_collection.findOne({_id:event_id}).on('error', function(err){
            console.warn(err.message);
        });
    };
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
                    var eventObject = {
                        name : req.body.name,
                        info : req.body.info,

                        startDay : req.body.startDay,
                        startMonth : req.body.startMonth,
                        startYear : req.body.startYear,

                        startHours : req.body.startHours,
                        startMinutes : req.body.startMinutes,    // turn this into utils function called

                        endDay : req.body.endDay,
                        endMonth : req.body.endMonth,
                        endYear : req.body.endYear,

                        endHours : req.body.endHours,
                        endMinutes : req.body.endMinutes,

                        street : req.body.street,
                        city : req.body.city,
                        postcode : req.body.postcode,
                        country : req.body.country,

                        phone: req.body.phone,
                        site : req.body.site,
                        attendees : [],
                        organiser : {
                            id:user._id,
                            fname : user.fname,
                            lname : user.lname,
                            email : user.email,
                            phone : user.phone
                        }
                    };
                    var collection = db.get('eventcollection');

                    collection.insert(eventObject, function (err, doc) {
                        if (err) {
                            res.send("There was a problem adding the information to the database.");
                        }
                        else {
                            retStatus = 'Success'
                            res.send({
                                retStatus : retStatus,
                                redirectTo: '/myevents'
                            });
                        };
                    });
                };
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
        console.log('Event ID: ' + event_id )
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
                retStatus = 'Success'
                res.send({
                    retStatus : retStatus,
                    redirectTo: '/myevents'
                });
            };
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
                                        XOAuth2: {
                                            user: "kwame.23@gmail.com",
                                            clientId: "830781104220.apps.googleusercontent.com",
                                            clientSecret: "qf6Yuk8-qkSAUitbEmd3eOTO",
                                            refreshToken: "1/JG9oE1i7XyLwyccKtbqfda-K_OczHC0MXdbDzgRU3Zs"
                                        }
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
                                    retStatus = 'Success'
                                    res.send({
                                        retStatus : retStatus,
                                        redirectTo: '/myevents'
                                    });
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
                                    redirectTo: '/events',
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
                                    redirectTo: '/events',
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