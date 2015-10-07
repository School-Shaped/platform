# Geting started:
run server locally:
redis-server  
foreman start -f Procfile.dev -e devel.env (Mac)  
nf start -f Procfile.dev -e devel.env (Ubuntu)  

create a new migration
sequelize -c

Migrate DB on heroku:
heroku run bash
sequelize -m -e production

# What is this platform?
The School Shaped platform is for development and distribution of education software prototypes. It provides two benefits: 1) A centralized and secure teacher and student login system 2) Easy distribution of apps, and collection of feedback.

Using edapps a teacher can log in, and view a dashboard of all the apps available for use. From the dashboard they can start an app, and the app will have access to all their user data (name, subject, students, or anything else).

# Developing

## We're Under construction!
Right this app allows teachers to create accounts and log in. However, there is no dashboard for displaying the available apps yet. There is also no concept of an "app" in the database, which means there is now way for us to receive feedback for an app. Build team, your mission: Create the dashboard for displaying all the available apps, and a way to collect feedback through the website for a specific app. The overview below will give you a sense for how edapps works. If you have any questions which you can't figure out, shoot me an email or ping me on slack. 

## Overview

Edapps is an express 3 app. Express is a web framework written in Javascript. It provides all the the important things you need to build a website. The three we care about most are 

1. Routing
2. Session storage
3. Request and response parsing/rendering

I'll just quickly go over weach of these components, and how express handles them. If you want more detail, check out the excellent [Olin.js lesson on express](https://github.com/olinjs/olinjs/tree/master/lessons/03-express-templates-mongo). 

### Routing

The routing layer maps a url path and a request method (/teacher/new, POST) to some functionality (create a new teacher). There can be an infinite number of urls, but there are only two request methods we care about right now: POST and GET. A GET method is used when a client wants to read some information from the server. A POST method is used when a client wants to modify or create some information. This categorization is just convention, and it's not enforced automatically. You could have an endpoint called /write_stuff which writes data when it receives a GET, but that would be confusing and bad. So we don't do that.  

To get back to routing, express makes it easy to map a request, with a url and method, to a javascript function. You do this like:

```javascript
app.get("/apps", function(req, res) {
    var number = 1 + 1
    console.log(number)
})
```

The above expression tells the webserver to add 1 + 1 and log the result to the server's console, whenever it receives a GET request to /apps.

Any new functionality you want to add to eddapps starts with a new route.

For more info on express routing check out it's [routing guide](http://expressjs.com/guide/routing.html).

### Session storage

NOTE: You won't need to do any work with sessions to build apps in edapps. However, it is still helpful to understand whats going on beneath the hood, so I recommend you read through the following section.

A session is a temporary store of data, related to a user. A session is what allows you to log in to facebook once, then navigate to a bunch of different facebook pages without needing to log in for each request. Essentially a session works like this:

1. A browser makes a request with valid user credentials.
2. The server gets the user data, including a unique user ID and generates a "session key". The session key is just a hash of the user id + a timestamp and some random secret. The hash is a way to make a unique string which someone else couldn't maliciously fake. After hashing, the session key might look like "lkasjdflkj2u9asndf00a-asdfasdf9asudf09ausd0fjaslkdfjlakjsdf". 
3. The server stores a key value pair of (session key, user id) in a cache. A cache is just a persistent version of a python dictionary. Most caches have a TTL (time to live) feature. This automatically removes key value pairs after a certain amount of time. With user sessions a cache might have a TTL of 1 week, to force a user to login again and start a new session, once a week.
4. The server returns the session key as a "cookie" which is a special item which the browser automatically stores on a per-domain basis. Cookies which are stored in a browser for a domain are sent to the server with every subsequent request to that domain. 
4. On every subsequent request the session key cookie is sent to the server. The server then looks to see if there is a user id for that key stored in cache. If so, it means the user is logged in. So it retrieves the user for that id, and then does whatever the user requested (for instance, return profile information). If there is no cache entry for a session key, the server will normally redirect to a login page, forcing the user to start a new session.

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

When a request is sent to a url, it comes with various kinds of parameters. There are three ways for a client to send parameters: 1) query parameters 2) url parameters 3) body parameters

1. Query Parameters
A GET request will usually contain "query parameters". These are parameters which are stored in the url itself, after the path: `www.eddapps.com/apps?query_param_name=this+cool+param`. Express allows you to access query params from a request with:

``` javascript
app.get("/apps", function(req, res) {    
    var queryParams = req.query
    var param = queryParams.query\_param\_name
    console.log(param) \\ -> "this cool param" 
})
```

2. Url Parameters 
Clients can also pass parameters within the url path itself. For instance a client might make a request to /apps/my\_cool\_app\_name to get info for the app called my\_cool\_app_name. In express you handle url parameters like this:

```javascript
app.get("/apps/:appName", function(req, res) {    
    console.log(req.params.appName);
})
```

The above example will take a request to /apps/my\_cool\_name and log "my\_cool\_app_name"

3. Request Body
The other common way of passing parameters is through a request body. This is usually used for POST requests. A request body is just additional data which is sent with a request in addition to a url and a method. Express gives access to the request body with:


``` javascript
app.post("/apps", function(req, res) {    
    var body = req.body
    var param = body.app_name
    console.log(param) // -> "{whatever the app name is}" 
})
```

Express also provides helpers to process responses. Responses are just the data which a server returns to a browser. Usually the response is in the form of a html document. Express provides a "templating engine", which makes it easy to generate nice HTML pages using data from the server (like user profile information). A good overview on templating can be found in this [olin.js lesson](https://github.com/olinjs/olinjs/tree/master/lessons/03-express-templates-mongo).

## Technologies specific to Edapps

Edapps uses a couple non-trivial plugins. Plugins are just external libraries of code which enable certain functionality. The two most importants we use are Passport and Sequelize.

### Passport
Passport provides logic for user authentication. When developing for edapps you should never have to worry about Passport. It is conifigured to include a user object in every authenticated request. The user object contains all related user data. You can retrieve the user object like:

``` javascript
app.post("/apps", function(req, res) {    
    var user = req.user

    if (user) {
      // get data from the user and do whatever you want
    } else {
      // redirect to login page, the user is not authenticated 
    }
})
```

### Sequelize 
Sequelize is an ORM (Objection-relational Mapping) for SQL like databases. If you want more information on ORMs or SQL-like databases, there's a ton of good guides online. For now, just know that we store all our data in a postgres database, and Sequelize is how we talk to postgres. Here's an overview of how sequelize works:

#### Migrations
We store data in a SQL-like DB. This means that every piece of data must abide by a certain schema. A DB is similar to python dictionary, in that it allows you to store key value pairs. However, a python dictionary allows you store whatever kind of keys and values you want, wherease a SQL-like DB is more strict. A SQL-like DB will only let you store data for which a schema is defined. A schema is just a description of a what a piece of data can look like. Schemas define two things: 1) A table name 2) column names. A table is a place where data of a certain type is stored. For instance, we have a table for all the teachers and a table for all the apps. A table can be imagined like an actual 2D array, where there are columns and rows. Each row in a table is a different piece of data, a different teacher or app. Each column is a different field on each user or app. A schema defines a table name, like Teachers, and then the names for each column like teacher name, subject area, etc, and well as the type of each column, String, Integer, Boolean, Datatime etc. Once a schema is defined we need to let the database know about the new schema, so we can store data abiding by that schema. To do this we create a "Migration". A migration is a file which, when executed using the Sequelize toolkit, creates or modifies a schema in a DB. In sequelize a migration looks like:

20150815200750-add_teachers.js
``` javascript
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable(
      'Teachers',
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        createdAt: {
          type: DataTypes.DATE
        },
        updatedAt: {
          type: DataTypes.DATE
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false
        },
        name: {
          type: DataTypes.STRING          
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false    
        }
      }
    ).complete(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Teachers').complete(done);
  }  
}
```

A few things to note: 
First, the file name. Migration file names are formatted like <timestamp>-add_<table name>. The timestamp is so sequelize knows the order in which to run migrations. This becomes important as you add migrations which add new columns to an existing table. If sequelize tries to run the migration for the new fields before running the migration which creates the table, then it will get an error.  

Second, the migration.createTable(...) command. This command takes two arguments. The first is the table name, in the above case Teachers. The second is an object containing column names as keys, with types and other options as values. There are a great many options you can add to a column, however the only ones you really need to care about for now are:

type: The type of the data. 
DataTypes.BIGINT (Long), DataTypes.STRING, DataTypes.DATE

primaryKey: Whether this field is the primary key for table. The primary key is the field which is used as THE key for each item. For Teachers, the primary key is the ID field. By labeling a field as the primary key, you are also telling the database to enforce the uniqueness of that field. AKA, if you try to create two teachers with the same id, the command will fail. 
true or false.

autoIncrement: Whether this field should be automatically generated in a monotonically increasing way. You'll only ever set this to true for the primary key field. This causes the DB to automatically set the ID for a new row to the previous row's ID + 1.
true or false.

allowNull: Whether this field can be unset at creation time. If you have a field which you KNOW will always be needed for a table (like user name), then you can set allowNull to false. Otherwise, leave as true. Anytime you add a new column to an existing table allowNull MUST be true, as that field will automatically be null for existing rows in the table. 

#### Models

A schema defines the DB representation of a certain kind of data. However, we need a separate definition for what data looks like within our app, in javascript. This is called a model. A model looks similar to a migration, with a few differences. Here is the model for the teachers migration from earlier:

models/teacher.js
``` javascript
module.exports = function(sequelize, DataTypes) {
    var Teacher = sequelize.define('Teacher', {
        username: DataTypes.STRING,
        name: DataTypes.STRING,
        passwordHash: DataTypes.STRING
    }, {
        classMethods: {                    
            associate: function(models) {
                Teacher.hasMany(models.Student, {foreignKey: "UserId"})
            }
        }
    })

    return Teacher
}
```

This model defines a javascript class which has the fields username, name and passwordHash, which can be populated based on the "Teachers" table. A couple things to note: 

First, the first argument to the model is "Teacher", whereas the table name we defined in our migration was "Teachers" (with an s). This is no mistake. Sequelize does some magic to make naming easier. One of it's less sensible pieces of magic is adding an "s" on to the table name argument passed into sequelize.define. 

Second, we have no createdAt or updatedAt fields in this model, although those were defined in the migration. Again, this is no mistake. Sequelize automatically defines a createdAt and updatedAt field in every model, and sets those automatically when creating and updating rows. 

Third, there is block of code:
``` javascript
associate: function(models) {
                Teacher.hasMany(models.Student, {foreignKey: "TeacherId"})
            } 
```
This code creates a model level association between a teacher and their students. Associations are just ways of saying that one row in a table has a relationship to another row in another table. The association above says that every Teacher can have many students, which are stored in the Students table, and that every student will have a column "TeacherId", which corresponds to it's owner teacher's ID. Now in the migration for the Students table you'll just need to make sure you include a column which looks like:

``` javascript
TeacherId:  {
          type: DataTypes.BIGINT,
          references: "Teachers",
          referenceKey: "id",
          onUpdate: "CASCADE",
          onDelete: "RESTRICT"
        }
```

And then in the students model you include a similar line:

``` javascript
associate: function(models) {
                Student.belongsTo(models.Teacher);
            }
```

This all allows you to (optionally), load all the students a teacher has, with their data, when loading a teacher, then access them in javascript:

``` javascript
db.Teacher.find({where: {id: teacherId}, include: [ db.Student ]}).then(function(teacher) {
  teacher.students // get a list of the students for a teacher.     
})
```

Associations are a bit tricky sometimes, but if you want more information there are a bunch of good guides online.

#### Accessing Data
Once you've defined and ran your migration, and defined your model in the models folder, you can start using your model to access data! To do this just require the models in your js file:`db = require('./models')`. Then use the db object to access data like this:

``` javascript
db.Teacher.findOne({where: {username: username}}).then(function(teacher){
  teacher.username // the stored name
  teacher.passwordHash // the stored passwordHash
}
```

## Adding a new app 

Under construction! We'll finish this once we finish the eddapps base. 
