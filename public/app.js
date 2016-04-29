var app = angular.module('spellBound', []);

app.controller('gameController', game);

app.$inject = ['$http'];

function game($http) {
  var vm = this;
  vm.message = "New Game";
  vm.answerText = "Answer";
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
      console.log(vm.letters);
    })
  }

  //The letter click
  vm.answerTry = function(letter) {
    var currentIndex = vm.letters.indexOf(letter);
    vm.inputAnswer.push((vm.letters.splice(currentIndex, 1)).toString());
    console.log(vm.inputAnswer);
  }

  //Confirms inputed spelling is correct
  vm.correct = function() {
    console.log(vm.inputAnswer.join(''));
    console.log(vm.word.word);
    if (vm.inputAnswer.join('') === vm.word.word) {
      return true;
    }
    return false;
  }
}
