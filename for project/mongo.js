const mongoose=require("mongoose")

mongoose.connect("mongodb://localhost:27017/database")
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
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
    }
})

const LogInCollection=new mongoose.model('data',logInSchema)

module.exports=LogInCollection