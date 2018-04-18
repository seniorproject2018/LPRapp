var express = require("express");

var bodyParser = require("body-parser");

var mongodb = require("mongodb");

var ObjectID = mongodb.ObjectID;



var REGISTERED_VEHICLES_COLLECTION = "registeredVehicles";

var VEHICLES_IN_LOT_COLLECTION = "vehiclesInLot";



var app = express();

app.use(bodyParser.json());



// Create a database variable outside of the database connection callback to reuse the connection pool in your app.

var db;



// Connect to the database before starting the application server.

mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://heroku_gs8hmkn3:a76tjk2171270hicfau9b5vv5u@ds143039.mlab.com:43039/heroku_gs8hmkn3", function (err, client) {

  if (err) {

    console.log(err);

    process.exit(1);

  }



  // Save database object from the callback for reuse.

  db = client.db();

  console.log("Database connection ready");



  // Initialize the app.

  var server = app.listen(process.env.PORT || 8080, function () {

    var port = server.address().port;

    console.log("App now running on port", port);

  });



  app.get('/', function(req, res) {

    res.send('It works');

  });

  //  API ROUTES BELOW



// Generic error handler used by all endpoints.

function handleError(res, reason, message, code) {

  console.log("ERROR: " + reason);

  res.status(code || 500).json({"error": message});

}



//returns an array of all vehicles in the registeredVehicles collection
app.get("/api/registeredVehicles", function(req, res) {

  db.collection(REGISTERED_VEHICLES_COLLECTION).find({}).toArray(function(err, docs) {

    if (err) {

      handleError(res, err.message, "Failed to get authorized vehicle.");

    } else {   

      res.status(200).json(docs);

    }

  });

});

//returns an array of all vehicles in the vehiclesInLot collection
app.get("/api/vehiclesInLot", function(req, res) {

  db.collection(VEHICLES_IN_LOT_COLLECTION).find({}).toArray(function(err, docs) {

    if (err) {

      handleError(res, err.message, "Failed to get vehicles in Lot.");

    } else {   

      res.status(200).json(docs);

    }

  });

});

//Adds a new vehicle to the registeredVehicles collection
app.post("/api/registeredVehicles", function(req, res) {

  var newVehicle = req.body
  newVehicle.createDate = new Date();

  if (!req.body.plate) {

    handleError(res, "Invalid user input", "Must provide a plate number.", 400);

  }else if (!req.body.studentID) {

    handleError(res, "Invalid user input", "Must provide a valid student ID.", 400);

  }else{
  db.collection(REGISTERED_VEHICLES_COLLECTION).insertOne(newVehicle, function(err, doc) {

    if (err) {

      handleError(res, err.message, "Failed to create new vehicle.");

    } else {

      res.status(201).json(doc.ops[0]);

    }

  });
  
  }

});

//Adds a new vehicle to the vehiclesInLot collection
app.post("/api/vehiclesInLot", function(req, res) {

  var newVehicle = req.body;

  newVehicle.createDate = new Date();

  if (!req.body.plate) {

    handleError(res, "Invalid user input", "Must provide a plate number.", 400);

  }else{
  db.collection(VEHICLES_IN_LOT_COLLECTION).insertOne(newVehicle, function(err, doc) {

    if (err) {

      handleError(res, err.message, "Failed to create new vehicle in lot.");

    } else {

      res.status(201).json(doc.ops[0]);

    }

  });
  
  }

});



app.get("/api/registeredVehicles/ID/:id", function(req, res) {

  db.collection(REGISTERED_VEHICLES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {

    if (err) {

      handleError(res, err.message, "Failed to get vehicle by id");

    } else {

      res.status(200).json(doc);

    }

  });

});

app.get("/api/vehiclesInLot/ID/:id", function(req, res) {

  db.collection(VEHICLES_IN_LOT_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get vehicle");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.get("/api/vehiclesInLot/Plate/:plate", function(req, res) {

  db.collection(VEHICLES_IN_LOT_COLLECTION).findOne({ plate: new ObjectID(req.params.plate) }, function(err, doc) {

    if (err) {

      handleError(res, err.message, "Failed to get info");

    } else {

      res.status(200).json(doc);

    }

  });

});


app.put("/api/registeredVehicles/:id", function(req, res) {

  var updateDoc = req.body;

  delete updateDoc._id;



  db.collection(REGISTERED_VEHICLES_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {

    if (err) {

      handleError(res, err.message, "Failed to update vehicles");

    } else {

      updateDoc._id = req.params.id;

      res.status(200).json(updateDoc);

    }

  });

});
app.put("/api/vehiclesInLot/:id", function(req, res){

  var updateDoc = req.body;

  delete updateDoc._id;



  db.collection(VEHICLES_IN_LOT_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {

    if (err) {

      handleError(res, err.message, "Failed to update vehicles");

    } else {

      updateDoc._id = req.params.id;

      res.status(200).json(updateDoc);

    }

  });

});




app.delete("/api/registeredVehicles/ID/:id", function(req, res) {

  db.collection(REGISTERED_VEHICLES_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {

    if (err) {

      handleError(res, err.message, "Failed to delete vehicle");

    } else {

      res.status(200).json(req.params.id);

    }

  });

});

app.delete("/api/vehiclesInLot/ID/:id", function(req, res){

  db.collection(VEHICLES_IN_LOT_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {

    if (err) {

      handleError(res, err.message, "Failed to delete vehicle");

    } else {

      res.status(200).json(req.params.id);

    }

  });

});

});