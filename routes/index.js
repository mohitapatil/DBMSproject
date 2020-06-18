var express = require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../models/user");
var Cart = require("../models/cart");
var Product = require("../models/product");
var Order = require('../models/order');
var Cart = require("../models/cart");

router.get("/",function(req,res){
	res.render("landing");
});

//get register form
router.get("/register",function(req,res){
	res.render("register");
}); 

router.post("/register", function(req, res){
    var newUser = new user({username: req.body.username});
	if(req.body.admincode === 'admincode'){
		newUser.isAdmin = true;
	}
    user.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/products"); 
        });
    });
});
	
	
//show login form
router.get("/login",function(req,res){
	res.render("login");
});
//router.use(productRoutes);
router.post("/login",passport.authenticate("local",
				{
					// successRedirect: "/products",
					failureRedirect: "/login"
}), function(req,res,next){
	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect("/products");
	}
});

router.get("/logout", function(req,res){
	req.logout();
	req.session.destroy();
	res.redirect("/products");
});

// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }

router.get("/profile", isLoggedIn, function (req,res,next){
	Order.find({user: req.user}, function(err, orders) {
		if(err) {
			return res.write("error");
		}
		var cart;
		orders.forEach(function(order){
			cart = new Cart(order.cart);
			order.items = cart.generateArray();
		});
		res.render("users/profile", { orders: orders});
	});
	// res.render("users/profile");
});

router.get('/add-to-cart/:id', function(req ,res ,next){
	var productId = req.params.id ;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	
	Product.findById(productId, function(err, product){
		if (err) {
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/products');
	});
});

router.get('/reduce/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	cart.removeItem(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req,res,next){
	if(!req.session.cart) {
		return res.render('shopping-cart', {products: null});
	}
	var cart = new Cart(req.session.cart);
	res.render('shopping-cart', {products: cart.generateArray(),totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn,function(req,res,next){
	if(!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	var errMsg = req.flash('error')[0];
	
	res.render('products/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout',function(req,res){
	if(!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
var stripe=require("stripe")("sk_test_51GqjnIK4s51wTJ1ClUHA9DZRtoyglY6pRdU0EBzkADFe7ePGOXTjAK7rBXenTiUhVsQtzMirCC0XKMQ5ZbOOUwgY00u8J04Qt8");
	stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "inr",
        source: "tok_mastercard", // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
		    // console.log("Entered ChargeCreate Callback Function.");
        if (err) {
			      // console.log("Encountered Stripe error.");
			req.flash('error', err.message);
            return res.redirect('/');
        }
		// var item = cart.generateArray();
		// item.forEach(function(item){
		// 	item.item.quantity-= item.qty;
		// 	Product.findByIdAndUpdate(item.item.id, item.item.quantity,function(err,updateProduct){
		// 		if(err){
		// 			console.log("err");
		// 		}else{
		// 	console.log(item.qty , item.item.quantity);
		// 		}
			// });		
		// });
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
		order.save(function(err, result) {
			      // console.log("Entered UserSave Callback Function.");
            req.session.cart = null;
            res.redirect('/');
		});
        });
    }); 

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.oldUrl = req.url;
	res.redirect("/login");
}

module.exports = router;