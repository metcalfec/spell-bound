var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
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

app.post('/game', jsonParser, function(req, res) {
  myClient.connect(url, function(error, db) {
    if (!error) {
      var word = db.collection('easy');
      word.find({word: titleCase(req.body.word)}).toArray(function(error, results) {
        letterArray(results[0].word.toUpperCase());
        var game = {
          word: results[0].word.toUpperCase(),
          wordArray: array,
          image: results[0].image
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

//Title cases word
function titleCase(word) {
  var wordArray = word.toLowerCase().split(' ');
  for (var i = 0; i < wordArray.length; i++) {
    var x = wordArray[i].charAt(0);
    wordArray[i] = wordArray[i].replace(wordArray[i].charAt(0), function replace(x) {
      return x.toUpperCase();
    });
  }
  return wordArray.join(' ');
}

app.listen(1337, function() {
  console.log("Listening on port 1337");
})
