const express = require("express");
const month = require("./myModules/getMonth");
const bodyParser = require("body-parser");
const { LogInCollection, Event } = require("./myModules/mongod");
const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.set('view engine','ejs');

app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.redirect("/login");
})

app.get('/home',(req,res)=>{
    month.getmonthFunc().then((data) => {
        Event.find({month:monthName.indexOf(Object.keys(data)[0])+1}).then((result)=>{
            if(data){
                res.render("home",{
                    currentMonth : Object.keys(data)[0],
                    currentDays : data[Object.keys(data)[0]],
                    currentYear:data["year"],
                    events: JSON.stringify(result),
                    monthNo:monthName.indexOf(Object.keys(data)[0])+1
                })
            }
        })
    });
})
.post('/home',(req,res)=>{
    month.getmonthFunc(req.body.button).then((data) => {
        Event.find({month:monthName.indexOf(Object.keys(data)[0])+1}).then((result)=>{
            if(data){
                res.render("home",{
                    currentMonth : Object.keys(data)[0],
                    currentDays : data[Object.keys(data)[0]],
                    currentYear:data["year"],
                    events: JSON.stringify(result),
                    monthNo:monthName.indexOf(Object.keys(data)[0])+1
                })
            }
        })
    });
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
    const data = {
        name: req.body.name,
        password: req.body.password,
        rollno: req.body.rollno,
        email: req.body.email
    }
    console.log(req.body)
    try {
        const checking = await LogInCollection.findOne({ email: req.body.email });

        if (checking) {
            return res.send("User details already exist.");
        } else {
            await LogInCollection.create(data);
            return res.redirect("/home");
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});


app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ email: req.body.Email });

        if (!check) {
            return res.redirect("/login?error=user_not_found");
        }

        if (check.password !== req.body.password) {
            return res.redirect("/login?error=incorrect_password");
        }
        res.redirect("/home");
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});



app.listen(3000);