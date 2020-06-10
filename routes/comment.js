var express = require("express");
var router  = express.Router();
var Product = require("../models/product");
var Comment = require("../models/comment");

router.get("/products/:id/comments/new",isLoggedIn,function(req,res){
	//find product by id
	Product.findById(req.params.id,function(err,product){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new",{product: product});
		}
	});
	//res.render("comments/new");
});

router.post("/products/:id/comments",isLoggedIn,function(req,res){
	//lookup products using id
	Product.findById(req.params.id,function(err,product){
		if(err){
			console.log(err);
			res.redirect("/products");	
		}else{
		Comment.create(req.body.comment,function(err,comment){
			if(err){
				console.log(err);
			}else {
				//add username and id to comment
				console.log(req.user.username);
				comment.author.id = req.user._id;
				comment.author.username = req.user.username;
				//save comment
				comment.save();
				product.comments.push(comment);
				product.save();
				console.log(comment);
				/////
				res.redirect("/products/" + product._id); 
				/////
			}
		});
		}
	});
	//create new comments
	//connect new comment to product
	//redirect product show page
});

//comment edit rout
router.get("/products/:id/comments/:comment_id/edit",checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}
		else{
			res.render("comments/edit",{product_id: req.params.id,comment: foundComment});
		}
	})
});

//comment update
router.put("/products/:id/comments/:comment_id",checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/products/" + req.params.id );
		}
	});
});

//comments destroy rout
router.delete("/products/:id/comments/:comment_id",checkCommentOwnership,function(req,res){
	//findByIdRemove
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			console.log("We have some error in deleting");
			res.redirect("back");
		} else{
			res.redirect("/products" + req.params.id);
		}
	});
});


function checkCommentOwnership(req,res,next){
	if(req.isAuthenticated()){
	 	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}else{
				//does user own the comment
			if(foundComment.author.id.equals(req.user._id)){
			next();
			}
			else{
				res.redirect("back");
			}
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


   