const mongoose = require('mongoose');
const {Schema} = mongoose;

const WorkerSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    contact:{
        type: String,
        required: true,
        unique: true
    },
    age:{
        type: Number,
        required: true
    },
    gender :{
        type : String,
        required : true
    },
    address: {
        type: Boolean,
        default: false
    },
    occupation : {
        type : String,
        required: true
    },
    verified : {
        type: Boolean,
        default : false
    }
});

module.exports = mongoose.model('worker', WorkerSchema);