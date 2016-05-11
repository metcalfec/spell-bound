var app = angular.module('spellBound');

app.controller('gameController', game);

app.$inject = ['$http'];

function game($http) {
  var vm = this;
  vm.answerPrompt = "Click the letters to begin.";
  vm.inputAnswer = [];
  vm.lastWord;
  vm.verdict;

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
      vm.difficulty = response.data.difficulty;
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
    gameStats.difficulty = vm.difficulty;
    var theGame = $http.post('/game/', gameStats);
    theGame.then(function(response) {
      vm.word = response.data;
      vm.lastWord = vm.word.word;
      vm.letters = response.data.wordArray;
      vm.streakCount = response.data.streak;
      vm.completedWords = response.data.completed;
      vm.currentLevel = response.data.level;
      vm.highScore = response.data.score;
      vm.difficulty = response.data.difficulty;
      levelUp(vm.streakCount);
      streak(vm.streakCount);
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
        if (x[0] != 9) {
          vm.nextLevel = (9 - x[0]) + " more until next level";
        } else {
          vm.nextLevel = "LEVEL UP!";
        }
      }
      else if (number < 10 && number !== 9) {
        vm.nextLevel = (9 - number) + " more until next level";
      } else {
        vm.nextLevel = "LEVEL UP!";
      }
    } else {
      vm.nextLevel = 9 + " more until next level";
    }
  }

  function levelUp(count) {
    if (count % 10 === 0 && count !== 0) {
      $('#level-tracker').popover('show');
      $('#level-tracker').on('shown.bs.popover', function() {
        setTimeout(function() {
          $('#level-tracker').popover('hide');
          $('#difficulty-tracker').popover('show');
          $('#difficulty-tracker').on('shown.bs.popover', function() {
            setTimeout(function() {
              $('#difficulty-tracker').popover('hide');
            }, 5000);
          });
        }, 3000);
      });
    }
    else if (count === 1) {
      $('#streak-tracker').popover('show');
      $('#streak-tracker').on('shown.bs.popover', function() {
        setTimeout(function() {
          $('#streak-tracker').popover('hide');
        }, 5000);
      });
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
