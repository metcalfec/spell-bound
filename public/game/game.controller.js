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
  vm.highScore = 0;
  vm.currentUser;
  vm.nextLevel;
  vm.currentLevel = 1;
  vm.level = "Easy";

  activate();

  function activate() {
    startGame();
  }

  //Initiate game
  function startGame() {
    var cookie = {name: (document.cookie.split('=').pop())};
    if (cookie.name) {
      var newWord = $http.post('/continue/', cookie);
    } else {
      var newWord = $http.get('/start/');
    }
    newWord.then(function(response) {
      vm.word = response.data;
      vm.lastWord = response.data.word;
      vm.letters = response.data.wordArray;
      vm.streakCount = response.data.streak;
      vm.completedWords = response.data.completed;
      vm.currentLevel = response.data.level;
      vm.highScore = response.data.score;
      vm.highScoreArray = [];
      streak(response.data.streak);
      getHighScores();
    })
  }

  // //New word
  function getGame(word) {
    var gameStats = {};
    gameStats.word = word;
    gameStats.pass = vm.verdict;
    gameStats.streak = vm.streakCount;
    gameStats.completed = vm.completedWords;
    gameStats.level = vm.currentLevel;
    gameStats.score = vm.highScore;
    var theGame = $http.post('/game/', gameStats);
    theGame.then(function(response) {
      vm.word = response.data;
      vm.lastWord = vm.word.word;
      vm.letters = response.data.wordArray;
      vm.streakCount = response.data.streak;
      vm.completedWords = response.data.completed;
      vm.currentLevel = response.data.level;
      vm.highScore = response.data.score;
      streak(response.data.streak);
      getHighScores();
    })
  }

  //Scoreboard
  function getHighScores() {
    var scoreboard = $http.get('/scores/');
    scoreboard.then(function(response) {
      vm.highScoreArray = response.data;
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

  //Level progress
  function streak(number) {
    if (number % 10 !== 0) {
      if (number > 10) {
        var x = number.toString().split('');
        while (x.length > 1) {
          x.shift();
        }
        vm.nextLevel = (9 - x[0]) + " more until next level";
      } else {
        vm.nextLevel = (9 - number) + " more until next level";
      }
    } else {
      if (number !== 0) {
        vm.nextLevel = 9 + " more until next level";
        $('#levelUpModal').modal('show');
      } else {
        vm.nextLevel = 9 + " more until next level";
      }
    }
  }

  //Prevent spacebar input
  $(function() {
    $('#name-input').on('keypress', function(e) {
      if (e.which == 32)
      return false;
    });
  });
}
