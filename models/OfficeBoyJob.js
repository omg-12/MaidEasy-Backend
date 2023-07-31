const mongoose = require('mongoose');
const { Schema } = mongoose;

const OfficeBoyJobSchema = new Schema({
    employerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    workerID:{
        type: String,
        unique : true
    },
    name :{
        type: String,
        required: true,
    },
    address : {
        type : String,
        default : ""
    },
    salary : {
        type : Number,
        default : 0
    },
    startDate : {
        type: Date,
        default: Date.now
    },
    hoursPerDay : {
        type : Number,
        default : 0
    },
    respect: {
        type: Number,
        default: 3
    },
    experience : {
        type : Number,
        default : 2
    }
});

module.exports = mongoose.model('officeboyjob', OfficeBoyJobSchema);