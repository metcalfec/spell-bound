var express = require('express');
var app = express();

var array = [];

app.use(express.static('./public'));

app.get('/game', function(req, res) {
  var game = {
    word: 'APPLE',
    wordArray: array,
    image: "http://images.clipartpanda.com/teacher-apple-border-clipart-KTjgkqLTq.jpeg",
    difficulty: 'Easy'
  }
  letterArray(game.word);
  res.json(game);
})

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
