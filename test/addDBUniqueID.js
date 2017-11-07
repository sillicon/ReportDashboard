var MongoClient = require('mongodb').MongoClient;

dataBaseUrl = "mongodb://localhost:27017/qareport"
MongoClient.connect(dataBaseUrl, function (err, db) {
	if (err) {
		console.log("Unable to connect to MongoDB Server. Please check DB Server status.");
		console.error(err);
		process.exit(1);
	}
    console.log("Successfully connected to MongoDB server");

    var collectionO = db.collection('backupCate');

    collectionO.find().toArray(function (err, docs) {
        var id = 1;
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
                            tempObj[tempObj.length - 1].child[arr[arr.length - 1]].id = id;
                            id++;
                            arr[arr.length - 1]++;
                        }
                    } else {
                        arr.pop();
                        tempObj.pop();
                        arr[arr.length - 1]++;
                    }
                }
            }
            collectionO.findOneAndUpdate({"_id": element._id}, element);
        }, this);
    })

    
    // db.createCollection("backupCate", {}).then(function (collection) {
    //     collectionO.find().toArray(function (err, docs) {
    //         docs.forEach(function(element) {
    //             collection.save(element);
    //         }, this);
    //     });
    //     collection.find().toArray(function (err, docs) {
    //         var id = 1;
    //         docs.forEach(function(element) {
    //             var tempObj = [element];
    //             var arr = [0];
    //             if (element.child != null) {
    //                 while (tempObj.length > 0) {
    //                     if (arr[arr.length - 1] <= tempObj[tempObj.length - 1].child.length - 1) {
    //                         if (tempObj[tempObj.length - 1].child[arr[arr.length - 1]].child != null) {
    //                             tempObj.push(tempObj[tempObj.length - 1].child[arr[arr.length - 1]]);
    //                             arr.push(0);
    //                         } else {
    //                             tempObj[tempObj.length - 1].child[arr[arr.length - 1]].id = id;
    //                             id++;
    //                             arr[arr.length - 1]++;
    //                         }
    //                     } else {
    //                         arr.pop();
    //                         tempObj.pop();
    //                         arr[arr.length - 1]++;
    //                     }
    //                 }
    //             }
    //             collection.findOneAndUpdate({"_id": element._id}, element);
    //         }, this);
    //     })
    // });

})