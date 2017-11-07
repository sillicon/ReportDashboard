var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();

router.get("/getTestName", function (req, res) {
    var db = req.app.get('dbConnection');
    // Get the documents collection
    var collection = db.collection('reportCategory');
    // if don't want "_id" attribute: project({ _id: 0, 'child._id': 0, 'child.child._id': 0})
    collection.find().toArray(function (err, docs) {
        if (err) {
            res.status(500).send({
                error: 'Database Query failed!'
            });
            throw (err);
        }
        res.send(docs);
    });
});

module.exports = router;