const express = require("express")
const path = require("path")
const app = express()
const LogInCollection = require("./myModules/mongo")
const port = process.env.PORT || 5500
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const tempelatePath = path.join(__dirname, './views')
const publicPath = path.join(__dirname, './public')
console.log(publicPath);

app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))


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

    try {
        const checking = await LogInCollection.findOne({ email: req.body.email });

        if (checking) {
            return res.send("User details already exist.");
        } else {
            await LogInCollection.create(data);
            return res.redirect("/login");
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});


app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.email })
        if (check.password === req.body.password) {
            res.status(201).redirect("/")
        }
        else {
            res.send("incorrect password")
        }
    } 
    catch (e) {
        res.send("wrong details")
    }
})



app.listen(port, () => {
    console.log('port connected');
})