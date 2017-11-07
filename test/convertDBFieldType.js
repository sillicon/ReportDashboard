var MongoClient = require('mongodb').MongoClient;

dataBaseUrl = 'mongodb://publisher:readandwrite@qareport-shard-00-00-bwtot.mongodb.net:27017,qareport-shard-00-01-bwtot.mongodb.net:27017,qareport-shard-00-02-bwtot.mongodb.net:27017/qareport?ssl=true&replicaSet=qareport-shard-0&authSource=admin';

MongoClient.connect(dataBaseUrl, function (err, db) {
	if (err) {
		console.log("Unable to connect to MongoDB Server. Please check DB Server status.");
		console.error(err);
		process.exit(1);
	}
    console.log("Successfully connected to MongoDB server");

    var collection = db.collection('reportResult');
    // Find some documents
    // if don't want "_id" attribute: project({ _id: 0, 'child._id': 0, 'child.child._id': 0})
    collection.find().toArray(function (err, docs) {
        docs.forEach(function (element) {
            var temp = new Date(element.testDate);
            collection.findOneAndUpdate({"_id": element._id}, {$set: {"testDate": temp}}
            )
        });
        
    });

})