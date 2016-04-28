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

  vm.answer = function(letter) {
    var currentIndex = vm.letters.indexOf(letter);
    // var clickedLetters =
    vm.inputAnswer.push((vm.letters.splice(currentIndex, 1)).toString());
    console.log(vm.inputAnswer);


  }
}
