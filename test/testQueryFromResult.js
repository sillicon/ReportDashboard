var MongoClient = require('mongodb').MongoClient;

dataBaseUrl = "mongodb://localhost:27017/qareport"
MongoClient.connect(dataBaseUrl, function (err, db) {
	if (err) {
		console.log("Unable to connect to MongoDB Server. Please check DB Server status.");
		console.error(err);
		process.exit(1);
	}
    console.log("Successfully connected to MongoDB server");

    var collection = db.collection('backupResult');
    // Find some documents
    // if don't want "_id" attribute: project({ _id: 0, 'child._id': 0, 'child.child._id': 0})
    collection.find({envirTested: 'Devext',testDate: {$gte: new Date('2017-04-05')}}).toArray(function (err, docs) {
        docs.forEach(function (element) {
            console.log(element.testDate);
        });
    });

    collection.find({$or:[{envirTested:"Production"},{envirTested:"QAext"}], testDate:{$gte: new Date("2017/10/19")}}).toArray(function (err, docs) {
        docs.forEach(function (element) {
            console.log(element.envirTested);
        });
    });

    collection.find({$or:[{envirTested:"Production"}], testDate:{$gte: new Date("2017/10/19")}}).toArray(function (err, docs) {
        docs.forEach(function (element) {
            console.log(element.envirTested);
        });
    });

})