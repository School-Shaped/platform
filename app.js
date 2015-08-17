var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , redis = require('redis')
  , RedisStore = require('connect-redis')(express)
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db   = require('./models')
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
  db.Teacher.findById({where: {id: id}}).then(function(teacher, err) {
    done(null, teacher)
  }).catch(function(err){
    done(err)
  })
})

passport.use(new LocalStrategy(function(username, password, done){
  db.Teacher.findOne({where: {password_hash: password}}).then(function(teacher){
    if (teacher) {
      done(null, teacher)
    } else {
      done(null, false, { message: "user name or password incorrect" })
    }
  }).catch(function(err){
    done(err)
  }) 
}))

app.get('/', routes.index);
app.post("/login", passport.authenticate('local'));
app.post("/teacher", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.Teacher.create({username: username, password_hash: password}).then(function(user){
    req.login(user)
    res.redirect("/")
  })
})

app.get("/teacher/:id", function(req, res) {
  var id = req.param.id
  res.send("id is " + id, 200)
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
