/*! qadashboard 2018-02-15 by sillicon */

const e=require("express"),t=e.Router();t.get("/getTestName",function(e,t){e.app.get("dbConnection").collection("reportCategory").find().toArray(function(e,o){e?(console.log(e),t.status(500).send("Database Query failed!")):t.send(o)})}),module.exports=t;