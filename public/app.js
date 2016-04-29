var app = angular.module('spellBound', []);

app.controller('gameController', game);

app.$inject = ['$http'];

function game($http) {
  var vm = this;
  vm.message = "New Game";
  vm.answerPrompt = "Click the letters to begin.";
  vm.inputAnswer = [];
  activate();

  function activate() {
    getNewGame();
  }

  function getNewGame() {
    var newWord = $http.get('http://localhost:1337/game');
    newWord.then(function(info) {
      vm.word = info.data;
      vm.letters = info.data.wordArray;
      console.log(info.data);
    })
  }

  //The letter click
  vm.answerTry = function(letter) {
    var currentIndex = vm.letters.indexOf(letter);
    vm.inputAnswer.push((vm.letters.splice(currentIndex, 1)).toString());
  }

  //Confirms inputed spelling is correct
  vm.correct = function() {
    if (vm.letters !== undefined) {
      if (vm.letters.length < 1) {
        if (vm.inputAnswer.join('') === vm.word.word) {
          $('#correctModal').modal('show');
          return true;
        }
        $('#incorrectModal').modal('show');
        return false;
      }
    }
  }
}
