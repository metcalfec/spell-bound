var express = require('express');
var app = express();
var port = process.env.PORT || 1337;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var cookieParser = require('cookie-parser');
var mongo = require('mongodb');
var myClient = mongo.MongoClient;
var url = 'mongodb://metcalfec:calv1n@ds013212.mlab.com:13212/spell-bound'

var array = [];
var currentUser;


app.use(express.static('./public/'));
app.use(cookieParser());
app.use(jsonParser);

//Login check
app.get('/login', function(req, res) {
  currentUser = req.cookies.name;
  if (req.cookies.name !== undefined) {
    myClient.connect(url, function(error, db) {
      if (!error) {
        var users = db.collection('users');
        users.find({name: titleCase(currentUser)}).toArray(function(error, results) {
          if (results.length !== 0) {
            var credentials = {
              verify: 'pass',
              user: currentUser
            };
            res.send(credentials);
            db.close();
          } else {
            res.send("Oops")
            db.close();
          }
        });
      } else {
        res.sendStatus(500);
        console.log('Could not connect to the database: ' + error);
      }
    });
  } else {
    res.send({verify: 'fail'});
  }
});

//Check if user exists in db
app.get('/login/:user', function(req, res) {
  currentUser = req.params.user;
  myClient.connect(url, function(error, db) {
    if (!error) {
      var users = db.collection('users');
      users.find({name: titleCase(currentUser)}).toArray(function(error, results) {
        if (results.length !== 0) {
          res.send({nameExists: true})
          db.close();
        } else {
          res.send({nameExists: false})
          db.close();
        }
      });
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

//Add new user to db
app.post('/user', function(req, res) {
  currentUser = req.body.name;
  myClient.connect(url, function(error, db) {
    if (!error) {
      var users = db.collection('users');
      users.insert(
        {
          name: titleCase(currentUser),
          streak: 0,
          completed: [],
          level: 1,
          score: 0
        }, function(error, results) {
      });
      var newUser = {
        name: titleCase(currentUser),
        streak: 0,
        completed: [],
        level: 1,
        score: 0
      };
      res.cookie('name', titleCase(currentUser));
      res.json(newUser);
      db.close();
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

//Start game no cookies
app.get('/start', function(req, res) {
  myClient.connect(url, function(error, db) {
    if (!error) {
      var word = db.collection('easy');
      word.find({}).toArray(function(error, results) {
        var randomResults = results[Math.floor(Math.random() * results.length)];
        letterArray(randomResults.word.toUpperCase());
        var game = {
          word: randomResults.word.toUpperCase(),
          wordArray: array,
          image: randomResults.image,
          caps: randomResults.word.toUpperCase(),
          sound: randomResults.sound,
          speech: randomResults.speech,
          definition: randomResults.definition,
        }
        res.send(game);
        db.close();
      });
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

//Return to game if cookies are present
app.post('/continue', function(req, res) {
  currentUser = req.body.name;
  var completedWords = [];
  var streakCount = 0;
  var currentLevel = 1;
  var highScore = 0;
  myClient.connect(url, function(error, db) {
    if (!error) {
      var users = db.collection('users');
      users.find({name: titleCase(currentUser)}).toArray(function(error, results) {
        if (results.length !== 0) {
          console.log(results[0])
          completedWords = results[0].completed;
          streakCount = results[0].streak;
          currentLevel = results[0].level;
          highScore = results[0].score;
        }
      });
      var word = db.collection('easy');
      word.find({}).toArray(function(error, results) {
        var randomResults = results[Math.floor(Math.random() * results.length)];
        letterArray(randomResults.word.toUpperCase());
        var game = {
          word: randomResults.word.toUpperCase(),
          wordArray: array,
          image: randomResults.image,
          caps: randomResults.word.toUpperCase(),
          sound: randomResults.sound,
          speech: randomResults.speech,
          definition: randomResults.definition,
          completed: completedWords,
          streak: streakCount,
          level: currentLevel,
          score: highScore
        };
        res.send(game);
        db.close();
      });
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

//Update db and generate new word
app.post('/game', function(req, res) {
  var completedWords = req.body.completed;
  var streakCount = req.body.streak;
  var currentLevel = req.body.level;
  var highScore = req.body.score;
  myClient.connect(url, function(error, db) {
    if (!error) {
      if (req.body.pass === true) {
        streakCount += 1;
        highScore += 1;
        completedWords.splice(0, 0, titleCase(req.body.word));
        var updateUser = db.collection('users')
        updateUser.update(
          {name: titleCase(currentUser)},
          {$push: {completed: titleCase(req.body.word)}},
          function(error, results) {
        });
        updateUser.update(
          {name: titleCase(currentUser)},
          {
            $set: {
              streak: streakCount,
              score: highScore
            }
          }, function(error, results) {
        });
        if (req.body.streak % 10 === 0 && req.body.streak !== 0) {
          currentLevel += 1;
          updateUser.update(
            {name: titleCase(currentUser)},
            {$set: {level: currentLevel}},
            function(error, results) {
          });
        }
        var theWord = db.collection('easy');
        theWord.find({}).toArray(function(error, results) {
          var randomResults = results[Math.floor(Math.random() * results.length)];
          letterArray(randomResults.word.toUpperCase());
          var game = {
            word: randomResults.word.toUpperCase(),
            wordArray: array,
            image: randomResults.image,
            caps: randomResults.word.toUpperCase(),
            sound: randomResults.sound,
            speech: randomResults.speech,
            definition: randomResults.definition,
            streak: streakCount,
            completed: completedWords,
            level: currentLevel,
            score: highScore
          }
          res.send(game);
          db.close();
        });
      } else {
        streakCount = 0;
        var updateUser = db.collection('users')
        updateUser.update(
          {name: titleCase(currentUser)},
          {$set: {streak: streakCount}},
          function(error, results) {
        });
        var theWord = db.collection('easy');
        theWord.find({word: titleCase(req.body.word)}).toArray(function(error, results) {
          letterArray(results[0].word.toUpperCase());
          var redo = {
            word: results[0].word.toUpperCase(),
            wordArray: array,
            image: results[0].image,
            caps: results[0].word.toUpperCase(),
            sound: results[0].sound,
            speech: results[0].speech,
            definition: results[0].definition,
            streak: streakCount,
            completed: completedWords,
            level: currentLevel,
            score: highScore
          }
          res.send(redo);
          db.close();
        });
      }
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

//High Scores
app.get('/scores', function(req, res) {
  myClient.connect(url, function(error, db) {
    if (!error) {
      var highScores = db.collection('users');
      highScores.find({}).toArray(function(error, results) {
        if (results.length !== 0) {
          var highScoreArray = [];
          for (var i = 0; i < results.length; i++) {
            highScoreArray.push(
              {
                name: results[i].name,
                score: results[i].score
              }
            )
          }
          highScoreArray.sort(function(a, b) {
            return b.score - a.score;
          });
          res.send(highScoreArray);
          db.close();
        } else {
          res.send()
          db.close();
        }
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
  var y = array.length - 1;
  var first = array[0];
  var tempVal;
  var randIndex;
  while ( x !== 0) {
    randIndex = Math.floor(Math.random() * x);
    x -= 1;
    tempVal = array[x];
    array[x] = array[randIndex];
    array[randIndex] = tempVal;
  }
  if (array[0] === first) {
    var i = array[0];
    var j = array[y];
    array[0] = j;
    array[y] = i;
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

app.listen(port, function() {
 console.log("listening on port " + port);
});
