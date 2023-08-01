const mongoose = require('mongoose');
require('dotenv').config()

// URL for using Mongo db Compass
// const mongoURI= 'mongodb://localhost:27017/inotebook'

// URL for using Mongo db Atlas
const mongoURI= process.env.DB_URL

// connecting to monogodb
const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connnected to mongo successfully!");
    })
}

module.exports = connectToMongo;