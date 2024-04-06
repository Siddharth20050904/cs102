const mongoose=require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vnuefms.mongodb.net/userDB?retryWrites=true&w=majority&appName=Cluster0`)
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log(e);
})

const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    rollno:{
        type:Number,
        required:false
    },
    Branch:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true
    }
})

const LogInCollection=new mongoose.model('data',logInSchema)

module.exports=LogInCollection