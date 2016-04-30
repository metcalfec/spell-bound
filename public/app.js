var app = angular.module('spellBound', []);

app.controller('gameController', game);

app.$inject = ['$http'];

function game($http) {
  var vm = this;
  vm.message = "New Game";
  vm.answerPrompt = "Click the letters to begin.";
  vm.inputAnswer = [];
  vm.lastWord;
  activate();

  function activate() {
    getGame();
  }

//Word delegation
  function getGame(retry) {
    if (retry !== undefined) {
      var repeat = {};
      repeat.word = retry;
      var retryWord = $http.post('http://localhost:1337/game/', repeat);
      retryWord.then(function(info) {
        vm.word = info.data;
        vm.lastWord = vm.word.word;
        vm.letters = info.data.wordArray;
      })
    } else {
      var newWord = $http.get('http://localhost:1337/game/');
      newWord.then(function(info) {
        vm.word = info.data;
        vm.lastWord = vm.word.word;
        vm.letters = info.data.wordArray;
      })
    }
  }

  //The letter click
  vm.answerTry = function(letter) {
    var currentIndex = vm.letters.indexOf(letter);
    vm.inputAnswer.push((vm.letters.splice(currentIndex, 1)).toString());
  }

  //Spell checks inputed answer
  vm.correct = function() {
    if (vm.letters !== undefined && vm.letters.length < 1 && vm.inputAnswer.length !== 0) {
      if (vm.inputAnswer.join('') === vm.word.word) {
        $('#correctModal').modal('show');
        return true;
      }
      $('#incorrectModal').modal('show');
      return false;
    }
  }

//Retry last word
  vm.retry = function(word) {
    vm.inputAnswer = [];
    getGame(word);
  }

//Get a new word
  vm.newGame = function() {
    vm.inputAnswer = [];
    getGame();
  }
}
