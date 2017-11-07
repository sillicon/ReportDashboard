var MongoClient = require('mongodb').MongoClient;

dataBaseUrl = "mongodb://localhost:27017/qareport"
MongoClient.connect(dataBaseUrl, function (err, db) {
	if (err) {
		console.log("Unable to connect to MongoDB Server. Please check DB Server status.");
		console.error(err);
		process.exit(1);
	}
    console.log("Successfully connected to MongoDB server");
    var dbCol = db.collection("backupCate");

    dbCol.find().toArray(function (err, docs) {
        var returnObj = {};
        if (err) {
            throw err;
        }
        docs.forEach(function(element) {
            var tempObj = [element];
            var arr = [0];
            if (element.child != null) {
                while (tempObj.length > 0) {
                    if (arr[arr.length - 1] <= tempObj[tempObj.length - 1].child.length - 1) {
                        if (tempObj[tempObj.length - 1].child[arr[arr.length - 1]].child != null) {
                            tempObj.push(tempObj[tempObj.length - 1].child[arr[arr.length - 1]]);
                            arr.push(0);
                        } else {
                            returnObj[tempObj[tempObj.length - 1].child[arr[arr.length - 1]].id] = tempObj[tempObj.length - 1].child[arr[arr.length - 1]].testName;
                            arr[arr.length - 1]++;
                        }
                    } else {
                        arr.pop();
                        tempObj.pop();
                        arr[arr.length - 1]++;
                    }
                }
            }
        }, this);
        console.log(returnObj);
    });
})
