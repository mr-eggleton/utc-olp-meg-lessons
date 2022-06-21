var http = require("http");
var express = require("express");

//https://www.tutorialspoint.com/expressjs/expressjs_authentication.htm
var Session = require("express-session");
const { google } = require("googleapis");
const people = google.people("v1");
const ClientId = process.env.CLIENT_ID;
const ClientSecret = process.env.CLIENT_SECRET;
const SessionSecret = process.env.SESSION_SECRET;
const RedirectionUrl =
  "https://utc-olp-glitch-butter.glitch.me/login/google/return";

var app = express();
app.use(
  Session({
    secret: SessionSecret,
    resave: true,
    saveUninitialized: true,
  })
);

function getOAuthClient() {
  return new google.auth.OAuth2(ClientId, ClientSecret, RedirectionUrl);
}

function getAuthUrl() {
  var oauth2Client = getOAuthClient();
  // generate a url that asks permissions for Google+ and Google Calendar scopes
  var scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes, // If you only need one scope you can pass it as string
  });

  return url;
}

//app.use("/oauthCallback", function (req, res) {
app.use("/login/google/return", function (req, res) {
  var oauth2Client = getOAuthClient();
  var session = req.session;
  var code = req.query.code;
  oauth2Client.getToken(code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens);
      session["tokens"] = tokens;

      var p = new Promise(function (resolve, reject) {
        people.people.get(
          {
            resourceName: "people/me",
            personFields: "emailAddresses,names,photos",
            auth: oauth2Client,
          },
          function (err, response) {
            resolve(response || err);
          }
        );
      }).then(function (data) {
        console.log(data.data);

        req.session.user = data.data;
        const photourl = data.data.photos[0].url;
        res.send(`
            <img src=${photourl} />
            <h3>Hello ${data.data.names[0].displayName}</h3>
            <p><a href="/details">Details</a></p>
        `);
      });
    } else {
      res.send(`
            <h3>Login failed!!</h3>
        `);
    }
  });
});

function checkSignIn(req, res, next) {
  if (req.session.user) {
    next(); //If session exists, proceed to page
  } else {
    var err = new Error("Not logged in!");
    console.log(req.session.user);
    next(err); //Error, trying to access unauthorized page!
  }
}

app.use("/details", checkSignIn, function (req, res) {
  var oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session["tokens"]);
  var session = req.session;

  var p = new Promise(function (resolve, reject) {
    people.people.get(
      {
        resourceName: "people/me",
        personFields: "emailAddresses,names,photos",
        auth: oauth2Client,
      },
      function (err, response) {
        resolve(response || err);
      }
    );
  }).then(function (data) {
    console.log(data.data);

    const photourl = data.data.photos[0].url;
    res.send(`
            <img src=${photourl} />
            <h3>Hello ${data.data.names[0].displayName}</h3>
        `);
  });
});

app.use("/", function (req, res) {
  var url = getAuthUrl();
  res.send(`
        <h1>Authentication using google oAuth</h1>
        <a href=${url}>Login</a>
    `);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

/*#
// index route
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
*/

// index route
app.get("/privacy", function (req, res) {
  res.sendFile(__dirname + "/views/privacy.html");
});

// index route
app.get("/terms", function (req, res) {
  res.sendFile(__dirname + "/views/terms.html");
});

// on clicking "logoff" the cookie is cleared
app.get("/logoff", function (req, res) {
  res.clearCookie("google-passport-example");
  res.redirect("/");
});
/*
// if cookie exists, success. otherwise, user is redirected to index
app.get('/success', requireLogin,
  function(req, res) {
    res.sendFile(__dirname + '/views/success.html');
  }
);

function requireLogin (req, res, next) {
  if (!req.cookies['google-passport-example']) {
    res.redirect('/');
  } else {
    next();
  }
};

function requireUser (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
};

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


*/


// pet.js - pet route module.
import express from "express";
var router = express.Router();
import { client } from "../config/prismicConfig.js"; //Get the prismic client

// Home page route.
router.get('/', function (req, res) {
  
  res.send('pet home page');
})

router.get("/:id", async (req, res) => {
  const pet = await client.getByUID("pet", req.params.id, 
    {
    graphQuery: `{
     pet {
       ...petFields
       species {
         ...speciesFields
       }
       traits {
         trait{
           ...on trait{
             ...traitFields
           }
         }
      }
    }
  }`
  }).catch(
    error =>{ //if there is an error finding the page
      res.status(500);
      res.render("500", {error});  
    }
  );;
  res.render("pet", { pet });
});

/*
router.get("/:id", async (req, res) => {
  const pet = await client.getByUID("pet", req.params.id, 
    {
    graphQuery: `{
     pet {
       name
       image
       age
       species {
         name
       }
       traits {
         trait{
           name
         }
       }
    }
  }`
  });
  res.render("pet", { pet });
});


*/
export { router as petroutes }