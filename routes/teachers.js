var db   = require('../models')
	, bcrypt = require('bcrypt-as-promised');


exports.create = function(req, res) {
	var username = req.body.username;
  var password = req.body.password;

  console.log("password", password)

  db.Teacher.findOne({where: {username: username}}).then(function(user) {
    if (user) {
      res.redirect("/teacher/create?err=user+already+exists")
    } else {
    	if (!username || !password) { 
    		res.redirect("/teacher/create?err=invalid+username+or+passord")
    	}

  		bcrypt.hash(password, 10).then(function(hash, err) {
  			if (err) {
  				res.send(err, 500)	
  				return 
  			} 

  			db.Teacher.create({username: username, passwordHash: hash}).then(function(user){
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