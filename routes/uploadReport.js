const express = require("express");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const ObjectID = require("mongodb").ObjectID;
const router = express.Router();

router.post("/uploadReport", function (req, res) {
    if (!req.body.hasOwnProperty("reportEnvi") || !req.body.hasOwnProperty("testID") || !req.body.hasOwnProperty("reportDate") || !req.body.hasOwnProperty("reportHTML") || !req.body.hasOwnProperty("reportResult")) {
        res.status(400).send("Bad Request. Missing important request parameter.");
    } else {
        var db = req.app.get("dbConnection");
        var collection = db.collection("reportResult");
        var inputHTML = req.body.reportHTML;
        var dateWithTime = getNowTime(req.body.reportDate);
        if (req.body.hasOwnProperty("reportName")) {
            var fileName = req.body.reportName + dateWithTime + ".html";
            writeInData(fileName);
        } else {
            var tempCol = db.collection("reportCategory");
            findTestName(tempCol, parseInt(req.body.testID), function (err, returnName) {
                if (err) {
                    res.status(500).send("Database query failed!");
                } else {
                    var fileName = returnName.replace(/\s+/g, "") + dateWithTime + ".html";
                    writeInData(fileName);
                }
            });
        }
    }

    function writeInData(fileName) {
        var reportFilePath = path.join(path.dirname(__dirname), "public", "report", fileName);
        var tempResult;
        if (req.body.reportResult.toLowerCase() === "pass") {
            tempResult = "Pass";
        } else if (req.body.reportResult.toLowerCase() === "fail") {
            tempResult = "Fail";
        } else {
            res.status(404).send("Test result parameter is not correct!");
            return;
        }
        var insertObj = {
            testID: parseInt(req.body.testID),
            testDate: convertToUTC(req.body.reportDate),
            testResult: tempResult,
            fileName: fileName,
            browser: req.body.reportBrowser,
            envirTested: req.body.reportEnvi,
            hiveTested: req.body.reportHive
        }
        fs.closeSync(fs.openSync(reportFilePath, "w"));
        if (fileName.indexOf("SharingAPI") > -1) {
            inputHTML = "<body style='white-space: pre-wrap;'>" + inputHTML + "</body>";
        }
        fs.writeFile(reportFilePath, inputHTML, "utf8", function write(err) {
            if (err) {
                res.status(500).send("Write html into database failed!");
                throw err;
            }
            collection.insertOne(insertObj).then(function (result) {
                res.send("Upload Complete!");
            }, function (err) {
                res.send(err);
                throw err;
            })
        });
    }
})

router.post("/publishComment", function (req, res) {
    var db = req.app.get("dbConnection");
    var dataCol = db.collection("reportResult");
    dataCol.find({
        "_id": ObjectID(req.body._id)
    }).toArray(function(err, docs) {
        if (err) {
            res.status(500).send("Database query failed!");
        } else {
            var doc = docs[0];
            if (doc.hasOwnProperty("comments")) {
                var comments = doc.comments;
                comments.push({
                    "commenter": req.body.commenter,
                    "comment": req.body.commentText,
                    "commentTime": new Date()
                });
                dataCol.update({
                    "_id": ObjectID(req.body._id)
                }, {
                    "$set": {
                        "comments": comments
                    }
                });
            } else {
                dataCol.update({
                    "_id": ObjectID(req.body._id)
                }, {
                    "$set": {
                        "comments": [{
                            "commenter": req.body.commenter,
                            "comment": req.body.commentText,
                            "commentTime": new Date()
                        }]
                    }
                });
            }
            res.status(200).send("Post comment complete.");
        }
    });
})

function findTestName(dbCol, inputID, cb) {
    dbCol.find().toArray(function (err, docs) {
        if (err) {
            console.log(err);
            cb(err, tempStr);
        } else {
            var tempStr = "";
            for (var i = 0; i < docs.length; i++) {
                var element = docs[i];
                var tempObj = [element];
                var arr = [0];
                if (element.child != null && tempStr === "") {
                    while (tempObj.length > 0) {
                        if (arr[arr.length - 1] <= tempObj[tempObj.length - 1].child.length - 1) {
                            if (tempObj[tempObj.length - 1].child[arr[arr.length - 1]].child != null) {
                                tempObj.push(tempObj[tempObj.length - 1].child[arr[arr.length - 1]]);
                                arr.push(0);
                            } else {
                                if (tempObj[tempObj.length - 1].child[arr[arr.length - 1]].id === inputID) {
                                    tempStr = tempObj[tempObj.length - 1].child[arr[arr.length - 1]].testName;
                                    break;
                                } else {
                                    arr[arr.length - 1]++;
                                }
                            }
                        } else {
                            arr.pop();
                            tempObj.pop();
                            arr[arr.length - 1]++;
                        }
                    }
                }
            }
            cb(err, tempStr);
        }
    });
}

function getNowTime(str) {
    var tempDate = moment(str, ["YYYY-MM-DD", "MM/DD/YYYY"]).toDate();
    var dd = tempDate.getDate();
    var mm = tempDate.getMonth() + 1;
    var yyyy = tempDate.getFullYear();
    var currentTime = new Date();
    var hh = currentTime.getHours();
    var min = currentTime.getMinutes();
    var ss = currentTime.getSeconds();
    if (dd < 10) {
        dd = "0" + dd;
    }
    if (mm < 10) {
        mm = "0" + mm;
    }
    if (hh < 10) {
        hh = "0" + hh;
    }
    if (min < 10) {
        min = "0" + min;
    }
    if (ss < 10) {
        ss = "0" + ss;
    }
    return mm + "_" + dd + "_" + yyyy + "_" + hh + "_" + min + "_" + ss;
}

function convertToUTC(dateStr) {
    var temp = moment(dateStr, ["YYYY-MM-DD", "MM/DD/YYYY"]).toDate();
    temp = new Date(temp.getTime() - temp.getTimezoneOffset() * 60000);
    return temp;
}

module.exports = router;