var app = angular.module('spellBound', []);

app.controller('gameController', game);

app.$inject = ['$http'];

function game($http) {
  var vm = this;
  vm.message = "New Game";

  var newWord = $http.get('http://localhost:1337/game');
  newWord.then(function(info) {
    vm.word = info.data;
    vm.letters = info.data.newWordArray;
    console.log(info.data);
    console.log(vm.letters);
  })
}
