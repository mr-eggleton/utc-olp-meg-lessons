// members.js - members route module with authorisation.
import express from "express";
var router = express.Router();

import { client } from "../config/prismicConfig.js"; //Get the prismic client

const isUserMember = (req, res, next) => {  
  if( req.session.grant.user.roles.member){
    next()
  } else {
    console.log("isUserMember Failed req.session.grant.user", req.session.grant.user)
    res.status(401);
    res.render('401', {requiredrole:"Member"} );  
  }
}

const isUserBoardMember = (req, res, next) => {  
  if( req.session.grant.user.roles.boardmember){
    next()
  } else {
    console.log("isUserBoardMember Failed req.session.grant.user", req.session.grant.user)
    res.status(401);
    res.render('401', {requiredrole:"Board Member"} );  
  }
  res.status(401);
  res.render('401', {} );  
} 

const _isUserAuthenticated = (req) => {  
  if ("grant" in req.session && 
      "user" in req.session.grant && 
      req.session.grant.user && "roles" in req.session.grant.user)
    {
      return true;
    } else{
      console.log("_isUserAuthenticated Failed req.session", req.session)
      return false;
    }
}
 
//Checks we are logged in
const isUserAuthenticated = (req, res, next) => {  
  if (_isUserAuthenticated(req))
  {
    //console.log("isUserAuthenticated req.session.grant.user", req.session.grant.user)
    next()
  } else {
    res.status(401);
    res.render('401', {error:"Access Restricted"} );  
  }
} 


//Members page only available if logged in
router.get("/minutes", [isUserAuthenticated, isUserBoardMember], async function (req, res) {
  const collection = {}//await client.getByUID("document_collection", "minutes-of-board-meetings");
  res.render("document_collection", { collection});
});



//Members page only available if logged in
router.get("/board", [isUserAuthenticated, isUserBoardMember], async function (req, res) {
  //console.log("members req.session",req.session);
  res.render("members/board", { });
});



//Members page only available if logged in
router.get("/", [isUserAuthenticated, isUserMember], async function (req, res) {
  //console.log("members req.session",req.session);
  res.render("members/index", { });
});
  

export { router as memberroutes }