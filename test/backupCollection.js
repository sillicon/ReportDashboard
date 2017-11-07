var MongoClient = require('mongodb').MongoClient;

dataBaseUrl = "mongodb://localhost:27017/qareport"
MongoClient.connect(dataBaseUrl, function (err, db) {
	if (err) {
		console.log("Unable to connect to MongoDB Server. Please check DB Server status.");
		console.error(err);
		process.exit(1);
	}
    console.log("Successfully connected to MongoDB server");

    var collectionO = db.collection('reportResult');
    
    db.createCollection("backupResult", {}).then(function (collection) {
        collectionO.find().toArray(function (err, docs) {
            docs.forEach(function(element) {
                collection.save(element);
            }, this);
        });
    });

})