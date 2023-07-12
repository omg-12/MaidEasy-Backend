const mongoose = require('mongoose');

// URL for using Mongo db Compass
// const mongoURI= 'mongodb://localhost:27017/inotebook'

// URL for using Mongo db Atlas
const mongoURI= "mongodb+srv://omgolhani3604:bkR9G9Ej4zEHtcIg@cluster0.nkgjagq.mongodb.net/MaidEasy"

// connecting to monogodb
const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connnected to mongo successfully!");
    })
}

module.exports = connectToMongo;