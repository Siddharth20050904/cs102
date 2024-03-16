const express = require("express");
const month = require("./myModules/getMonth");
const bodyParser = require("body-parser");


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.set('view engine','ejs');

app.use(express.static("public"));

app.get('/',(req,res)=>{
    month.getMonth().then((data) => {
        if(data){
            res.render("home",{
                month : Object.keys(data)[0],
                days : data[Object.keys(data)[0]],
                year:data["year"]
            })
        }
    });
})
.post('/',(req,res)=>{
    month.getMonth(req.body.button).then((data) => {
        if(data){
            res.render("home",{
                month : Object.keys(data)[0],
                days : data[Object.keys(data)[0]],
                year : data["year"]
            })
        }
    });
})

app.listen(3000);