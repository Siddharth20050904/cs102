const express = require("express");
const month = require("./myModules/getMonth");
const bodyParser = require("body-parser");
const Event = require("./myModules/mongod");
const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.set('view engine','ejs');

app.use(express.static("public"));

app.get('/',(req,res)=>{
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
.post('/',(req,res)=>{
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
    res.redirect('/');
})
app.get('/db',(req,res)=>{
    Event.find()
    .then((event)=>{
        console.log(event);
    })
    .catch((err)=>{console.log(err)})
})

app.listen(3000);