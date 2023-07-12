const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    contact :{
        type : String,
        unique : true,
        required : true
    },
    verified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('user', UserSchema);