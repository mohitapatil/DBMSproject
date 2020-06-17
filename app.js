var express      = require("express");
var	app          = express();
var bodyParesr   = require("body-parser");
var mongoose     = require("mongoose");
var Product      = require("./models/product");
var Comment      = require("./models/comment");
var cookieParser = require('cookie-parser');
var session      = require("express-session");
var passport     = require("passport");
var LocalStratergy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride= require("method-override");
var user         =require("./models/user");
var MongoStore   =require('connect-mongo')(session);
var stripe       =require("stripe")("sk_test_51GqjnIK4s51wTJ1ClUHA9DZRtoyglY6pRdU0EBzkADFe7ePGOXTjAK7rBXenTiUhVsQtzMirCC0XKMQ5ZbOOUwgY00u8J04Qt8");
var flash        =require("connect-flash");
// var seedDB       = require("./seeds");

// seedDB();


var commentRoutes  = require("./routes/comment");
var productRoutes  = require("./routes/products");
//console.log("database connecting");
var indexRoutes    =require("./routes/index");

// mongoose.connect("mongodb+srv://MohitPatil:QPWOE123@cluster0-8gr38.mongodb.net/DBMSproject?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb://localhost:27017/Store",{useNewUrlParser: true, useUnifiedTopology: true });
console.log("database connected");
app.use(bodyParesr.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

mongoose.set('useFindAndModify', false);

// app.use(function(req,res,next){
// 	res.locals.currentUser = req.user;
// 	next();
// });

app.use(cookieParser());
//passport config
app.use(session({
	secret : "once again!!",
	resave : false,
	saveUninitialized : false,
	store: new MongoStore({mongooseConnection: mongoose.connection}),
	cookie: { maxAge: 100 * 60 * 1000}
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.session = req.session;
	res.locals.message = req.flash("error");
	next();
});

app.use(commentRoutes);
app.use(productRoutes);
app.use(indexRoutes);

// app.post('/charge', function(req,res){
// 	var token = req.body.stripeToken;
// 	var chargeAmount= req.body.chargeAmount;
// 	var charge = stripe.charges.create({
// 		amount: chargeAmount,
// 		currency:  "inr",
// 		source: token,
// 		description: "test charge"
// 	},function(err,charge){
// 		if(err & err.type === "SripeCardError"){
// 			console.log("Your card was declined");
// 		}
// 	});
// 	            req.session.cart = null;
// 	res.redirect('/');
// });

app.listen(3000,function(){
	console.log("store is now open!");
});
