"use strict";
import express from "express"; 
import MarkdownIt from 'markdown-it';
import namedheadings from "markdown-it-id-and-toc"//markdown-it-named-headings"
import hljs from 'highlight.js'; 
import fs from "fs" 
import { client, getPage } from "./config/prismicConfig.js"; //Get the prismic client
import { hbs } from "./config/hbsConfig.js"; // Load handlebars with addons
// Generic node.js express init:
const app = express();
app.use(express.static("public"));
hbs.registerPartials("./views/partials");
hbs.localsAsTemplateData(app);

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

import * as prismicH from '@prismicio/helpers'
const addMenu = async(app) => {
  const pages = await client.getAllByType("page");
  var pagelist = pages.map((page)=>{
    return {url: page.url, name:titleCase(page.uid.replace(/-/g," ")),  title:prismicH.asText(page.data.title)}
  })
  app.locals.menu = pagelist;
} 

addMenu(app);

//Set up handlebars using the hbs library
app.set("view engine", "hbs");
app.set("views", "./views");
app.set("view options", { layout: "layout" }); // add layout.hbs as the basis of all rendering 


const apiServer = "https://utc-olp-api-proxy.glitch.me";

import axios from "axios";
import session from "express-session";
app.use(
  session({
    name: "grant",
    secret: "very secret",
    saveUninitialized: true,
    resave: false,
  })
); 

//Sets the login callback address for use in the the login link
app.locals.logincallback = "https://"+process.env.PROJECT_DOMAIN+".glitch.me/hello"
app.locals.apiserver = apiServer;

//Check whether we have the login data for this browser and set it in the template
function addUserInfo(req, res, next){
  if ("grant" in req.session && 
      "user" in req.session.grant && 
      req.session.grant.user != false)
    {
      //console.log("req.session.grant.response.profile", req.session.grant.response.profile)
      res.locals.user = req.session.grant.user;
    } else {
      res.locals.user = false;
    }
  next();
}
app.use(addUserInfo);

//Callback page for login stores the login info
app.get("/hello", async function (req, res) {
  console.log("/hello req.query", req.query)
  req.session.grant = {
    response : req.query,
    user: false
  };
  axios.post(apiServer+'/ethel/roles/'+req.session.grant.response.profile.email)
  .then(function (response) {
    //console.log("response.data", response.data)
    req.session.grant.user = {
      name : req.session.grant.response.profile.name,
      email : req.session.grant.response.profile.email,
      roles : response.data
    }
    res.redirect("/members")
  })
  .catch(function (error) {
    req.session.grant.user = false;
    console.log(error);
  }); 
});

app.get("/logout", async function (req, res) {
  if(req.session){
     delete req.session['grant'];
  }
  res.redirect("/")
});

//Functions to render pages
const renderIndex = async (req, res) => {//now gets the realeted pages
  try{ 
  res.render("index", { });   // render index.hbs with the data and send it to the browser
  
  } catch (error) { // If something goes wrong show an 500 error page
    res.status(500);
    res.render('500', {error} );  
  }
} 

const renderSearch = async (req, res) => {
  res.render("posts", {  }); // render posts.hbs with the data and send it to the browser
}
 
// Routes to conect URLs to functions 
app.get("/", renderIndex);
app.get("/search/:search", renderSearch);



import { lessonroutes } from './routes/lesson.js';
app.use('/', lessonroutes);

// Start server
app.listen(process.env.PORT || 3000);

