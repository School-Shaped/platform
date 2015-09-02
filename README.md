# Geting started:
run server locally:
redis-server
foreman start -f Procfile.dev -e devel.env

create a new migration
sequelize -c

Migrate DB on heroku:
heroku run bash
sequelize -m -e production

# What is edapps?
Edapps is a platform for development education software prototypes. It provides two benefits: 1) A centralized and secure teacher and student login system 2) Easy distribution of apps, and collection of feedback.

Using edapps a teacher can log in, and view a dashboard of all the apps available for use. From the dashboard they can start an app, and the app will have access to all their user data (name, subject, students, or anything else).

# Developing on edapps

## Edapps is under construction!
Right now edapps allows teachers to create accounts and log in. However, there is no dashboard for displaying the available apps yet. There is also no concept of an "app" in the database, which means there is now way for us to receive feedback for an app. Build team, your mission: Create the dashboard for displaying all the available apps, and a way to collect feedback through the website for a specific app. The overview below will give you a sense for how edapps works. If you have any questions which you can't figure out, shoot me an email or ping me on slack (between the hours of 8-11 AM or PM for the next two weeks). 

## Overview

Edapps is an express 3 app. Express is a web framework written in Javascript. It provides all the the important things you need to build a website. The three we care about most are 

1. Routing
2. Session storage
3. Request and response parsing/rendering

I'll just quickly go over what each of those components are, and how express handles them. If you want more detail, check out the excellent [Olin.js lesson on express](https://github.com/olinjs/olinjs/tree/master/lessons/03-express-templates-mongo). 

### Routing

The routing layer maps a url path and a request method (/teacher/new, POST) to some functionality (create a new teacher). There can be an infinite number of urls, but there are only two request methods we care about right now: POST and GET. A GET method is used when a client wants to read some information from the server. A POST method is used when a client wants to modify or create some information. This categorization is just convention, and it's not enforced automatically. You could have an endpoint called /write_stuff which writes data when it receives a GET, but that would be confusing and bad. So we don't do that.  

To get back to routing, when makes it easy to map a request, with a url and method, to a javascript function. You do this like this:

```javascript
app.get("/apps", function(req, res) {
    var number = 1 + 1
    console.log(number)
})
```

The above expression tells the webserver to add 1 + 1 and log the result to the server's console, whenever it receives a GET request to /apps.

There are more complicated things you can do with routing too. For instance you can extract paramters from the path itself:

```javascript
app.get("/apps/:appName", function(req, res) {    
    console.log(appName);
})
```

The above example will take a request to /apps/my\_cool\_name to log "my\_cool\_app_name"

Any new functionality you want to add to eddapps starts with a new route.

For more info on express routing check out it's [routing guide](http://expressjs.com/guide/routing.html).

### Session storage

NOTE: You won't need to do any work with sessions to build apps in edapps. However, it is still helpful to understand whats going on underneath the hood, so I recommend you read through the following section.

A session a a temporary store of data, related to a user. A session is what allows you to log in to facebook once, then navigate to a bunch of different facebook pages without needing to log in for each request. Essentially a session works like this:

1. A browser makes a request with valid user credentials.
2. The server gets the user data, including a unique user ID and generates a "session key". The session key is just a hash of the user id + a timestamp and some random secret. The hash is a way to make a unique string which someone else couldn't maliciously fake. It looks like "lkasjdflkj2u9asndf00a-asdfasdf9asudf09ausd0fjaslkdfjlakjsdf". 
3. The server stores a key value pair of (session key, user id) in a cache. A cache is just a persistent version of a python dictionary. Most caches have a TTL (time to live) feature. This automatically removes key value pairs after a certain amount of time. With user sessions a cache might have a TTL of 1 week, to force a user to login again and start a new session, once a week.
4. The server returns the session key as a "cookie" which is a special item which the browser automatically stores on a per-domain basis. Cookies which are stored in a browser for a domain are sent to the server with every subsequent request to that domain. 
4. On every subsequent request the session key cookie is sent to the server. The server then looks to see if their is a user id for that key stored in cache. If so, it retrieves the user for that id, and then does whatever the user requested (for instance, return profile information). If there is no cache entry for a session key, the server will normally redirect to a login page, forcing the user to start a new session.

Most of the session logic is taken care of by express. You just need to tell express what kind of cache to use. In the case of Edapps we use a cache called (Redis)[http://redis.io/], with no TTL for now. There is also some logic taken care of by our authentication plugin, passport. In app.js you'll see code like:

```javascript
passport.serializeUser(function(user, done) {  
  console.log("user is ", user);
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {  
  db.Teacher.findById(id).then(function(teacher, err) {
    return done(null, teacher)
  }).catch(function(err){
    return done(err)
  })
})
```

This code tells passport how to store a user session in cache. The serializeUser function tells passport to hash the user.id into the session. Then the deserializeUser function tells passport to user the hash from the session as an id, and look up the user.

If any of this is unclear, don't worry, as mentioned earlier you won't need to do anything with sessions to build apps in edapps. 

### Request and response parsing/process

When a request is sent to a url, it comes with various kinds of parameters. A GET request will usually contain "query parameters". These are parameters which are stored in the url itself, after the path: `www.eddapps.com/apps?query_param_name=this+cool+param`. Express allows you to access query params from a request with:

``` javascript
app.get("/apps", function(req, res) {    
    var queryParams = req.query
    var param = queryParams.query\_param\_name
    console.log(param) \\ -> "this cool param" 
})
```

The other common way of passing parameters is through a request body. This is usually used for POST requests. A request body is just additional data which is sent with a request in addition to a url and a method. Express gives access to the request body with:


``` javascript
app.post("/apps", function(req, res) {    
    var body = req.body
    var param = body.app_name
    console.log(param) \\ -> "{whatever the app name is}" 
})
```

Express also provides helpers to process responses. Responses are just the data which a server returns to a browser. Usually the response is in the form of a html document. Express provides a "templating engine", which makes it easy to generate nice HTML pages using data from the server (like user profile information). A good overview on templating can be found in this [olin.js lesson](https://github.com/olinjs/olinjs/tree/master/lessons/03-express-templates-mongo).

## Adding a new app 

Under construction! We'll finish this once we finish the eddapps base. 
