var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();

router.post("/uploadReport", function (req, res) {
    var db = req.app.get('dbConnection');
    var collection = db.collection('reportResult');
    var inputHTML = req.body.reportHTML;
    var dateWithTime = getNowTime(req.body.reportDate);
    var fileName = req.body.reportName + dateWithTime + ".html";
    var reportFilePath = path.join(path.dirname(__dirname), "public", "report", fileName);
    var insertObj = {
        testID: parseInt(req.body.testID),
        testDate: convertToUTC(req.body.reportDate),
        testResult: req.body.reportResult,
        fileName: fileName,
        browser: req.body.reportBrowser,
        envirTested: req.body.reportEnvi,
        hiveTested: req.body.reportHive
    }
    fs.closeSync(fs.openSync(reportFilePath, 'w'));
    if (req.body.reportName.indexOf("SharingAPI") > -1) {
        inputHTML = "<body style='white-space: pre-wrap;'>" + inputHTML + "</body>";
    }
    fs.writeFile(reportFilePath, inputHTML, 'utf8', function write(err) {
        if (err) {
            res.send("Copy html into database failed!");
            throw err;
        }
        collection.insertOne(insertObj).then(function(result) {
            res.send("Upload Complete!");
        }, function (err) {
            res.send(err);
            throw err;
        })
    });
})

function getNowTime(str) {
    var tempDate = convertToUTC(str);
    var dd = tempDate.getDate();
    var mm = tempDate.getMonth() + 1;
    var yyyy = tempDate.getFullYear();
    var currentTime = new Date();
    var hh = currentTime.getHours();
    var min = currentTime.getMinutes();
    var ss = currentTime.getSeconds();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (hh < 10) {
        hh = '0' + hh;
    }
    if (min < 10) {
        min = '0' + min;
    }
    if (ss < 10) {
        ss = '0' + ss;
    }
    return mm + "_" + dd + "_" + yyyy + "_" + hh + "_" + min + "_" + ss;
}

function convertToUTC(dateStr) {
    var temp = new Date(dateStr);
    temp = new Date(temp.getTime() + temp.getTimezoneOffset() * 60000);
    return temp;
}

module.exports = router;