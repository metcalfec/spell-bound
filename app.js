var express = require('express');
var app = express();

var newWordArray = [];

app.use(express.static('./public'));

app.get('/game', function(req, res) {
  var game = {
    word: 'APPLE',
    difficulty: 'Medium',
    newWordArray: newWordArray
  }
  letterArray(game.word);
  res.json(game);
})

function letterArray(word) {
  newWordArray = [];
  for (var i = 0; i < word.length; i++) {
    newWordArray.push(word[i]);
  }
}

app.listen(1337, function() {
  console.log("Listening on port 1337");
})
