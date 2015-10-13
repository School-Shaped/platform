var db   = require('../models')
	, bcrypt = require('bcrypt-as-promised');


exports.create = function(req, res) {
	var fullname = req.body.fullname;
  var username = req.body.username;
  var password = req.body.password;
  var usertitle = req.body.usertype;

  if (usertitle == "Teacher") {
    var usertype = 0
  } else if (usertitle == "Student") {
    var usertype = 1
  } else if (usertitle == "Builder") {
    var usertype = 2
  } else if (usertitle == "Administrator") {
    var usertype = 3
  } else if (usertitle == "Other") {
    var usertype = 4
  }

  console.log(fullname, username, password, usertype);


  db.User.findOne({where: {username: username}}).then(function(user) {
    if (user) {
      res.redirect("/teacher/create?err=user+already+exists")
    } else {
    	console.log("here");
      if (!username || !password) { 
    		res.redirect("/teacher/create?err=invalid+username+or+password")
    	}

  		bcrypt.hash(password, 10).then(function(hash, err) {
  			if (err) {
  				res.send(err, 500)	
  				return 
  			}
  
  			db.User.create({username: username, passwordHash: hash, usertype: usertype, fullname: fullname}).then(function(user){
      		req.login(user, function(err) {
      			if (err) {
      				res.send(err, 500)	
      				return 
      			} 

    				res.redirect("/")	
    				return         			
      		})        		
    		}).catch(function(err) {
        	res.send(err, 500)
        	return 
      	})    
			});	    	
    }
  }) 
}