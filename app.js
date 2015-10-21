var express = require('express')
  , routes = require('./routes')  
  , users = require('./routes/users')
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
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {  
  db.User.findById(id).then(function(user, err) {
    return done(null, user)
  }).catch(function(err){
    return done(err)
  })
})

passport.use(new LocalStrategy(function(username, password, done){  
  db.User.findOne({where: {username: username}}).then(function(user){    
    if (!user) {
      return done(null, false, { message: "User not found" })
    }    

    bcrypt.compare(password, user.passwordHash).then(function(res) {             
      return done(null, user);    
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

app.post("/user", users.create)
app.post("/user/create_teacher_student", users.createTeacherStudent)
app.post("/user/create_app_creator", users.createTeacherStudent)

app.get("/login", function(req, res) {    
  res.render("login", { message: "fix me" });
  // res.render("login", { message: req.flash("error") });
})

app.get("/user/create", function(req, res) {
  res.render("create-teacher");
})

app.get("/user", function(req, res) {
  user = req.user;
  if (!user) {
    return res.redirect("/login")
  }

  res.render("user-profile")
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

exports.app = app;
exports.db = db;
