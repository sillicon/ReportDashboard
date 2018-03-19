/*! qadashboard 2018-03-18 by sillicon */

const e=require("express"),s=e.Router();s.get("/getGitToken",function(e,s){e.user?s.send(e.user.accessToken):s.send(null)}),s.get("/getGitUser",function(e,s){e.user?s.send(e.user):s.send(null)}),module.exports=s;