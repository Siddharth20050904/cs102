const express = require("express");
const month = require("./myModules/getMonth");
const bodyParser = require("body-parser");
const { LogInCollection, Event } = require("./myModules/mongod");
const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
var passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.set('view engine','ejs');

app.use(express.static("public"));

app.use(session({
    secret:"NOHACKERSALLOWED",
    resave:false,
    saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/",(req,res)=>{
    if(req.isAuthenticated()){
        console.log(req.user)
        res.redirect("/home");
    }else{
        res.redirect("/login");
    }
})

app.get('/home',(req,res)=>{
    if(req.isAuthenticated()){
        month.getmonthFunc().then((data) => {
            Event.find({month:monthName.indexOf(Object.keys(data)[0])+1}).then((result)=>{
                if(data){
                    res.render("home",{
                        currentMonth : Object.keys(data)[0],
                        currentDays : data[Object.keys(data)[0]],
                        currentYear:data["year"],
                        events: JSON.stringify(result),
                        monthNo:monthName.indexOf(Object.keys(data)[0])+1
                    });
                }
            });
        });
    }else{
        res.redirect("/login");
    } 
})
.post('/home',(req,res)=>{
    if(req.isAuthenticated()){
        month.getmonthFunc(req.body.button).then((data) => {
            Event.find({month:monthName.indexOf(Object.keys(data)[0])+1}).then((result)=>{
                if(data){
                    res.render("home",{
                        currentMonth : Object.keys(data)[0],
                        currentDays : data[Object.keys(data)[0]],
                        currentYear:data["year"],
                        events: JSON.stringify(result),
                        monthNo:monthName.indexOf(Object.keys(data)[0])+1
                    });
                }
            });
        });
    }else{
        res.redirect("/login");
    }
})


app.get('/edit',(req,res)=>{
    res.render('page3');
})
.post('/edit',(req,res)=>{
    const event = Event({
        eventType: req.body.eventType,
        year: Number(req.body.eventDate.substr(0,4)),
        month: Number(req.body.eventDate.substr(5,2)),
        date: Number(req.body.eventDate.substr(8,2)),
        eventTitle: req.body.eventTitle,
        eventDescription: req.body.eventDescription
    })

    event.save();
    res.redirect('/home');
})
app.get('/db',(req,res)=>{
    Event.find()
    .then((event)=>{
        console.log(event);
    })
    .catch((err)=>{console.log(err)})
})

app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/login', (req, res) => {
    res.render('login')
})


app.post('/signup', async (req, res) => {

    try {
        const checking = await LogInCollection.findOne({ email: req.body.username });

        if (checking) {
            return res.send("User details already exist.");
        } else {
            bcrypt.hash(req.body.password,10,async (err,hashedPassword)=>{
                if(err){
                    console.log(err);
                }else{
                    const data = {
                        name: req.body.name,
                        password: hashedPassword,
                        rollno: req.body.rollno,
                        email: req.body.email
                    }
                    const result = await LogInCollection.create(data);
                    req.login(result,(err)=>{
                        console.log(err);
                        res.redirect("/home");
                    });
                } 
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});


app.post('/login', passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/login"
}));

passport.use(new LocalStrategy(async function verify(username,password,cb){
    try {
        const check = await LogInCollection.findOne({ email: username });

        if (!check) {
            return cb("User Not Found");
        }

        // comparing hashed password

        bcrypt.compare(password,check.password, async(err,result)=>{
            if(err){
                return cb(err);
            }else{
                if(result){
                    return cb(null,check)
                }else{
                    return cb(null,false);
                }
            }           
        })    
    } catch (error) {
        return cb(error)
    }
}));

passport.serializeUser((user,cb)=>{
    cb(null,user);
});

passport.deserializeUser((user,cb)=>{
    cb(null,user);
});

app.listen(3000);