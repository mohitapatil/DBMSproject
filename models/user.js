var mongoose = require("mongoose"); 
//var Schema = mongoose.Schema; 
var passportLocalMongoose = require("passport-local-mongoose"); 
mongoose.set('useCreateIndex', true);
  
var userSchema = new mongoose.Schema({    
    name : String,
	email : String,
	password : String,
	isAdmin: {type: Boolean,default: false}
}); 
  
// plugin for passport-local-mongoose 
userSchema.plugin(passportLocalMongoose); 
  
// export userschema 
 module.exports = mongoose.model("user", userSchema);