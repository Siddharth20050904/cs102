// importing required modules and functions
const express = require("express");
const month = require("./myModules/getMonth"); // importing custom module for getting the current month
const bodyParser = require("body-parser");
const { LogInCollection, Event } = require("./myModules/mongod"); // importing MongoDB models
const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"]; // array for month names
const path = require("path");
const bcrypt = require("bcrypt"); // for password hashing
const session = require("express-session");
var passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // using local strategy for authentication
const mails = require('./myModules/sendMails'); // custom module for sending emails

//initializing app
const app = express();

//using body-parser as middleware to handle requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//setting ejs engine in views library
app.set('view engine','ejs');

//express.static for static css
app.use(express.static("public"));

// creating sessions and secret keys
app.use(session({
    secret:"NOHACKERSALLOWED",
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:1000*60*60*24} // cookie expires in 24 hours
}));

//initialize the passport and session connection to passport
app.use(passport.initialize());
app.use(passport.session());

// request for localhost
app.get("/",(req,res)=>{
    //checking authentication
    if(req.isAuthenticated()){
        res.redirect("/home"); // redirect to home page if authenticated
    }else{
        res.redirect("/login"); // redirect to login page if not authenticated
    }
});

// route for home page
app.route('/home')
.get((req,res)=>{
    if(req.isAuthenticated()){
        // calling getMonthFunc() function from local library
        month.getmonthFunc().then((data) => {
            // finding the month from mongodb
            Event.find({month:monthName.indexOf(Object.keys(data)[0])+1}).then((result)=>{
                if(data){
                    //rendering home page with passing following data
                    res.render("home",{
                        currentMonth : Object.keys(data)[0],
                        currentDays : data[Object.keys(data)[0]],
                        currentYear:data["year"],
                        events: JSON.stringify(result),
                        monthNo:monthName.indexOf(Object.keys(data)[0])+1,
                        user: req.user
                    });
                }
            });
        });
    }else{
        res.redirect("/login");
    } 
})
.post(async (req,res)=>{
    if(req.isAuthenticated()){
        if(req.body.button != null){
            month.getmonthFunc(req.body.button).then((data) => {
                Event.find({month:monthName.indexOf(Object.keys(data)[0])+1}).then((result)=>{
                    if(data){
                        res.render("home",{
                            currentMonth : Object.keys(data)[0],
                            currentDays : data[Object.keys(data)[0]],
                            currentYear:data["year"],
                            events: JSON.stringify(result),
                            monthNo:monthName.indexOf(Object.keys(data)[0])+1,
                            user: req.user
                        });
                    }
                });
            });
        }else{
            await Event.deleteOne({_id:req.body.delete});
            res.redirect('/');
        }
    }else{
        res.redirect("/login");
    }
});

// route for about page
app.route('/about')
.get((req,res)=>{
    if(req.isAuthenticated()){
        res.render('about'); // render about page if authenticated
    }else{
        res.redirect('/login'); // redirect to login page if not authenticated
    }
})

// route for editing events
app.route('/edit')
.get((req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.userType=="staff")
            res.render('edit'); // render edit page if authenticated user is staff
        else
            res.redirect('/home'); // redirect to home if authenticated user is not staff
    }else{
        res.redirect('/login'); // redirect to login page if not authenticated
    }
})
.post(async (req,res)=>{
    // creating new event object
    const event = Event({
        eventType: req.body.eventType,
        year: Number(req.body.eventDate.substr(0,4)),
        month: Number(req.body.eventDate.substr(5,2)),
        date: Number(req.body.eventDate.substr(8,2)),
        eventTitle: req.body.eventTitle.replace(/'/g,"#").replace(/"/g,"~"), // replacing special characters
        eventDescription: req.body.eventDescription.replace(/'/g,"#").replace(/"/g,"~"), // replacing special characters
        faculty_name: req.user.name,
        faculty_email: req.user.email
    })

    // getting array of students from database
    const studentsArray = await LogInCollection.find({userType:"student"});
    
    // sending emails to students
    mails.sendEmails(studentsArray,event);

    // saving event to database
    event.save();
    res.redirect('/home'); // redirecting to home page after adding event
})

// route for signup page
app.route('/signup')
.get((req, res) => {
    res.render('signup') // render signup page
})
.post(async (req, res) => {
    // checking if passwords match
    if(req.body.password==req.body.confirmPassword){
        try {
            const checking = await LogInCollection.findOne({ email: req.body.username });
    
            if (checking) {
                return res.send("User details already exist."); // user already exists
            } else {
                bcrypt.hash(req.body.password,10,async (err,hashedPassword)=>{
                    if(err){
                        console.log(err);
                    }else{
                        // creating new user data
                        const data = {
                            name: req.body.name,
                            password: hashedPassword,
                            rollno: req.body.rollno,
                            email: req.body.email,
                            Branch : req.body.branch,
                            userType: "student"
                        }
                        // saving user data to database
                        const result = await LogInCollection.create(data);
                        req.login(result,(err)=>{
                            console.log(err);
                            res.redirect("/home"); // redirect to home page after successful signup
                        });
                    } 
                });
            }
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).send("Internal Server Error");
        }
    }else{
        res.redirect("/signup") // redirect to signup page if passwords don't match
    }    
});

// route for login page
app.route('/login')
.get((req, res) => {
    res.render('login') // render login page
})
.post(passport.authenticate("local",{
    successRedirect:"/home", // redirect to home page if login successful
    failureRedirect:"/login" // redirect back to login page if login fails
}));

// route for user profile
app.route('/profile')
.get(async (req,res)=>{
    if(req.isAuthenticated()){
        await LogInCollection.findOne({_id:req.user._id})
        .then((result)=>{
            res.render('profile',{user:result}); // render user profile page
        })
        .catch(err=>console.log(err));
    }else{
        res.redirect('/login'); // redirect to login page if not authenticated
    }
})
.post(async (req,res)=>{
    // updating user profile data
    await LogInCollection.findOneAndUpdate({_id:req.user._id},
    {
        name:req.body.edit_name,
        rollno:req.body.edit_roll,
        Branch:req.body.branch,
        email:req.body.edit_email
    }).then((result)=>{
        res.redirect('/profile'); // redirect to user profile page after updating
    })
})

// logout route
app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/'); // redirect to home page after logout
    });
  });

// configuring passport local strategy
passport.use(new LocalStrategy(async function verify(username,password,cb){
    try {
        const check = await LogInCollection.findOne({ email: username });

        if (!check) {
            return cb("User Not Found"); // user not found
        }

        // comparing hashed password
        bcrypt.compare(password,check.password, async(err,result)=>{
            if(err){
                throw err;
            }else{
                if(result){
                    return cb(null,check) // successful authentication
                }else{
                    return cb(null,false); // incorrect password
                }
            }           
        })    
    } catch (error) {
        return cb(error)
    }
}));

// passport serialization and deserialization
passport.serializeUser((user,cb)=>{
    cb(null,user);
});

passport.deserializeUser((user,cb)=>{
    cb(null,user);
});

// listening on port 3000
app.listen(3000);
