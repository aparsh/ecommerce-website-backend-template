var mongoose = require('mongoose');
//require('mongoose-type-email');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var User = new Schema({
    firstname: {
        type: String,
        default:''
    },
    lastname: {
        type: String,
        default:''
    },
    password:{
        type:String,
        required:true
    },
    email: {
        type: String, 
        default:''
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);