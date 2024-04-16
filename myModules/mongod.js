const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

main();

const eventSchema = mongoose.Schema({
  eventType: String,
  year:Number,
  month:Number,
  date:Number,
  eventTitle: String,
  eventDescription: String,
  faculty_name:String,
  faculty_email:String
});

const logInSchema = mongoose.Schema({
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
  },
  userType:{
      type:String,
      required:true
  }
});

async function main() {
  await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vnuefms.mongodb.net/calendarDB?retryWrites=true&w=majority&appName=Cluster0`);
}

const Event = mongoose.model('Event',eventSchema);

const LogInCollection = mongoose.model('User',logInSchema);

module.exports = { LogInCollection, Event };