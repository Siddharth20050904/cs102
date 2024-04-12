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
    saveUninitialized:true,
    cookie:{maxAge:1000*60*60*24}
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
});

app.route('/home')
.get((req,res)=>{
    if(req.isAuthenticated()){
        month.getmonthFunc().then((data) => {
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
                            userType: req.user.userType
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

app.route('/edit')
.get((req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.userType=="staff")
            res.render('edit');
        else
            res.redirect('/home');
    }else{
        res.redirect('/login');
    }
})
.post((req,res)=>{
    const event = Event({
        eventType: req.body.eventType,
        year: Number(req.body.eventDate.substr(0,4)),
        month: Number(req.body.eventDate.substr(5,2)),
        date: Number(req.body.eventDate.substr(8,2)),
        eventTitle: req.body.eventTitle,
        eventDescription: req.body.eventDescription,
        faculty_name: req.user.name,
        faculty_email: req.user.email
    })

    event.save();
    res.redirect('/home');
})

app.route('/signup')
.get((req, res) => {
    res.render('signup')
})
.post(async (req, res) => {

    if(req.body.password==req.body.confirmPassword){
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
                            email: req.body.email,
                            Branch : req.body.branch,
                            userType: "student"
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
    }else{
        res.redirect("/signup")
    }    
});

app.route('/login')
.get((req, res) => {
    res.render('login')
})
.post(passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/login"
}));

app.route('/profile')
.get(async (req,res)=>{
    if(req.isAuthenticated()){
        await LogInCollection.findOne({_id:req.user._id})
        .then((result)=>{
            res.render('profile',{user:result});
        })
        .catch(err=>console.log(err));
    }else{
        res.redirect('/login');
    }
})
.post(async (req,res)=>{
    await LogInCollection.findOneAndUpdate({_id:req.user._id},
    {
        name:req.body.edit_name,
        rollno:req.body.edit_roll,
        Branch:req.body.branch,
        email:req.body.edit_email
    }).then((result)=>{
        res.redirect('/profile');
    })
})

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

passport.use(new LocalStrategy(async function verify(username,password,cb){
    try {
        const check = await LogInCollection.findOne({ email: username });

        if (!check) {
            return cb("User Not Found");
        }

        // comparing hashed password

        bcrypt.compare(password,check.password, async(err,result)=>{
            if(err){
                throw err;
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