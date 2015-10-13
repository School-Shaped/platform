var express = require('express')
  , routes = require('./routes')  
  , teachers = require('./routes/teachers')
  , http = require('http')
  , redis = require('redis')
  , RedisStore = require('connect-redis')(express)
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('./models')
  , bcrypt = require('bcrypt-as-promised')
  , flash = require('connect-flash')
  , path = require('path');  

var app = express();

var redisClient;
if (process.env.REDISTOGO_URL) {
  var rtg = url.parse(process.env.REDISTOGO_URL);
  var redisClient = redis.createClient(rtg.port, rtg.hostname);

  redisClient.auth(rtg.auth.split(":")[1]);
} else {
  redisClient = redis.createClient();
}

app.configure(function(){
  var session = express.session({secret: '1234567890QWERTY', store: new RedisStore({
      client: redisClient
  })});

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(flash());
  app.use(session);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

passport.serializeUser(function(user, done) {  
  console.log("user is ", user);
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {  
  db.User.findById(id).then(function(teacher, err) {
    return done(null, teacher)
  }).catch(function(err){
    return done(err)
  })
})

passport.use(new LocalStrategy(function(username, password, done){
  console.log("using the strat");

  db.User.findOne({where: {username: username}}).then(function(teacher){
    console.log("teacher", teacher);
    if (!teacher) {
      return done(null, false, { message: "User not found" })
    }    

    bcrypt.compare(password, teacher.passwordHash).then(function(res) {       
      return done(null, teacher)    
    }).catch(function(err){
      done(null, false, { message: "Password incorrect" })
    });    
  }).catch(function(err) {    
    return done(err)
  }) 
}))

app.post("/login", passport.authenticate('local', {
  successRedirect: "/",
  failureRedirect: "/login?err=problem+authenticating",
  failureFlash: true
}));

app.post("/teacher", teachers.create)

app.get("/login", function(req, res) {    
  res.render("login", { message: req.flash("error") });
})

app.get("/teacher/create", function(req, res) {
  res.render("create-teacher");
})

app.get("/", function(req, res) {
  user = req.user;  
  if (!user) {
    return res.redirect("/login")
  }

  res.send("id is " + user.id, 200)
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
