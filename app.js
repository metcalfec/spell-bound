var express = require('express');
var app = express();
var mongo = require('mongodb');
var myClient = mongo.MongoClient;
var url = 'mongodb://localhost/spell-bound'

var array = [];

app.use(express.static('./public'));

app.get('/game', function(req, res) {
  myClient.connect(url, function(error, db) {
    if (!error) {
      var word = db.collection('easy');
      word.find({}).toArray(function(error, results) {
        var randomResults = results[Math.floor(Math.random() * results.length)];
        letterArray(randomResults.word.toUpperCase());
        var game = {
          word: randomResults.word.toUpperCase(),
          wordArray: array,
          image: randomResults.image
        }
        res.json(game);
        db.close();
      });
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

//Explodes words into an array
function letterArray(word) {
  array = [];
  for (var i = 0; i < word.length; i++) {
    array.push(word[i]);
  }
  randomArray(array);
}

//Randomizes array
function randomArray(array) {
  var x = array.length;
  var tempVal;
  var randIndex;
  while ( x !== 0) {
    randIndex = Math.floor(Math.random() * x);
    x -= 1;
    tempVal = array[x];
    array[x] = array[randIndex];
    array[randIndex] = tempVal;
  }
  return array;
}

app.listen(1337, function() {
  console.log("Listening on port 1337");
})
