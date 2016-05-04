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

app.use(express.static('./public/'));
app.use(cookieParser());
app.use(jsonParser);

app.get('/check/login', function(req, res) {
  if (req.cookies.name !== undefined) {
    var credentials = {
      verify: 'pass',
      user: req.cookies.name
    };
    res.send(credentials);
  } else {
    res.send('fail');
  }
});

app.get('/check/login/:user', function(req, res) {
  myClient.connect(url, function(error, db) {
    if (!error) {
      currentUser = req.params.user;
      var users = db.collection('users');
      users.find({name: titleCase(currentUser)}).toArray(function(error, results) {
        if (results.length !== 0) {
          var credentials = {
            found: true,
            user: titleCase(currentUser)
          };
          res.cookie('name', titleCase(currentUser));
          res.send(credentials);
          db.close();
        } else {
          res.send(false)
          db.close();
        }
      });
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

app.post('/login', function(req, res) {
  myClient.connect(url, function(error, db) {
    if (!error) {
      var newUser = req.body.name;
      var users = db.collection('users');
      users.insert({name: titleCase(newUser)}, function(error, results) {
        res.cookie('name', titleCase(newUser));
        res.send();
        db.close();
      });
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

app.delete('/login/:user', function(req, res) {
  myClient.connect(url, function(error, db) {
    if (!error) {
      var user = req.params.user;
      var users = db.collection('users');
      users.remove({name: titleCase(user)}, function(error, results) {
        res.send();
        db.close();
      });
    } else {
      res.sendStatus(500);
      console.log('Could not connect to the database: ' + error);
    }
  });
});

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

app.post('/game', function(req, res) {
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

// app.put('/game/streak', function(req, res) {
//   console.log("hi");
  // myClient.connect(url, function(error, db) {
  //   if (!error) {
  //     var user = db.collection('users');
  //     user.update(
  //       {
  //         name: titleCase(req.body.word),
  //         streak:
  //       }).toArray(function(error, results) {
  //       res.json(game);
  //       db.close();
  //     });
  //   } else {
  //     res.sendStatus(500);
  //     console.log('Could not connect to the database: ' + error);
  //   }
  // });
// });

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
