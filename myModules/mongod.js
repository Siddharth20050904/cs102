const mongoose = require('mongoose');
const express = require('express');

const app = express();

main();

const eventSchema = mongoose.Schema({
    date: Number,
    month: Number,
    year:Number,
    event: String,
    eventType: String
})

const Event = mongoose.model('Event',eventSchema);

app.get('/',(req,res)=>{
    const event = new Event({
        date:13,
        month:3,
        year:2024,
        event:"Exam"
    });
    
    event.save();
})

async function main() {
  await mongoose.connect('mongodb+srv://siddharth:cs102db@cluster0.vnuefms.mongodb.net/eventDB?retryWrites=true&w=majority&appName=Cluster0');
}

app.listen(8080)