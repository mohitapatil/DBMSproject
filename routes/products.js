var express = require("express");
var router  = express.Router();
var Product = require("../models/product");
var Comment = require("../models/comment");

router.get("/products", function(req,res){
	//get product from DB
	Product.find({},function(err,allproducts){
		if(err){
			console.log(err);
		}else{
			res.render("products/Index",{products:allproducts});
		}
	});
	//res.render("products",{products:products});
});

router.post("/products",isLoggedIn,function(req,res){
	// get data from /products/new & add it to products
	var name=req.body.name;
	var image= req.body.image;
	var price= req.body.price;
	var quantity= req.body.quantity;
	var desc= req.body.description;
	var type= req.body.type;
	var newProduct = {name: name,image: image,price: price, description: desc,type: type,quantity: quantity}
	//Create new product and save to database
	Product.create(newProduct,function(err,newlyCreated){
		if(err){
			console.log(err);
		}else{
				//Redirect back to products
	res.redirect("/products");
		}
	});
});

router.get("/products/new",isLoggedIn, function(req,res){
	res.render("products/new.ejs");
});

//Show individual product details
router.get("/products/:id",function(req,res){
	// //FIND product with required id
	// Product.findById(id,callback)
	Product.findById(req.params.id).populate("comments").exec(function(err,foundProduct){
		if(err){
			console.log(err);
		}else{
			res.render("products/show",{products:foundProduct});
		}
	});

});

//edit product router
router.get("/products/:id/edit",checkProductOwnership,function(req,res){
	//is logged findById
	 	Product.findById(req.params.id,function(err,foundProduct){
			res.render("products/edit",{product: foundProduct});
		});
});

//update product route
router.put("/products/:id",checkProductOwnership,function(req,res){
	//find and update correct products
	Product.findByIdAndUpdate(req.params.id,req.body.product,function(err,updatedProduct){
		if(err){
			res.redirect("/products");
		}else{
			res.redirect("/products/" + req.params.id);
		}
	});
});

//Destroy products
router.delete("/products/:id",checkProductOwnership,function(req,res){
	Product.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/products");
		}else{
			res.redirect("/products");
		}
	});
});

function checkProductOwnership(req,res,next){
	if(req.isAuthenticated()){
	 	Product.findById(req.params.id,function(err,foundProduct){
		if(err){
			res.redirect("back");
		}else{
				//if admin
			if(req.user.isAdmin){
			next();
			}
			else{
				res.redirect("back");			}
		}
	});
	}
		//else redirect
	else{
		res.redirect("back");
	}
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
