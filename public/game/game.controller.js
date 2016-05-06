var app = angular.module('spellBound');

app.controller('gameController', game);

app.$inject = ['$http'];

function game($http) {
  var vm = this;
  vm.message = "New Game";
  vm.answerPrompt = "Click the letters to begin.";
  vm.inputAnswer = [];
  vm.lastWord;
  vm.verdict;
  vm.streakCount = 0;
  vm.completedWords = [];
  vm.currentUser;
  activate();

  function activate() {
    startGame();
  }

  //Initial game
  function startGame() {
    var cookie = {name: (document.cookie.split('=').pop())};
    if (cookie !== undefined) {
      var newWord = $http.post('/game/remembered/', cookie);
    } else {
      var newWord = $http.get('/game/');
    }
    newWord.then(function(response) {
      vm.word = response.data;
      vm.lastWord = vm.word.word;
      vm.letters = response.data.wordArray;
      vm.streakCount = response.data.streak;
      vm.completedWords = response.data.completed;
      console.log(response.data)
      // vm.currentUser = (document.cookie.split('=').pop());
      streak(response.data.streak);
    })
  }

  //New word
  function getGame(word) {
    var gameStats = {};
    gameStats.word = word;
    gameStats.pass = vm.verdict;
    gameStats.streak = vm.streak;
    gameStats.completed = vm.completedWords;
    var theGame = $http.post('/game/', gameStats);
    theGame.then(function(response) {
      vm.word = response.data;
      vm.lastWord = vm.word.word;
      vm.letters = response.data.wordArray;
      vm.streakCount = response.data.streak;
      vm.completedWords = response.data.completed;
      streak(response.data.streak);
    })
  }

  //The letter click
  vm.answerTry = function(letter) {
    var currentIndex = vm.letters.indexOf(letter);
    vm.inputAnswer.push((vm.letters.splice(currentIndex, 1)).toString());
  }

  //Undo letter click
  vm.undo = function(letter) {
    var currentIndex = vm.inputAnswer.indexOf(letter);
    vm.letters.push((vm.inputAnswer.splice(currentIndex, 1)).toString());
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

  //Play again
  vm.playAgain = function(word, verdict) {
    vm.inputAnswer = [];
    vm.verdict = verdict;
    if (verdict === false) {
      vm.streakCount = 0;
    }
    getGame(word);
  }

  //Streak counter
  function streak(number) {
    if (number % 10 !== 0) {
      if (number > 10) {
        var x = number.toString().split('');
        while (x.length > 1) {
          x.pop(0);
        }
        vm.nextLevel = (10 - x[0]) + " until next level";
      } else {
        vm.nextLevel = (10 - number) + " until next level";
      }
    } else {
      vm.nextLevel = 10 + " until next level";
    }
  }
}
