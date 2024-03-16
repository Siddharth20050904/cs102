const mongoose = require('mongoose');

main();

const eventSchema = mongoose.Schema({
    date: Number,
    month: Number,
    year:Number,
    event: String,
    eventType: String
})

async function main() {
  await mongoose.connect('mongodb+srv://siddharth:cs102db@cluster0.vnuefms.mongodb.net/eventDB?retryWrites=true&w=majority&appName=Cluster0');
}

const Event = mongoose.model('Event',eventSchema);

module.exports = Event;