var app = angular.module('spellBound', []);

app.controller('homeController', home);

app.$inject = ['$http'];

function home($http) {
  var vm = this;
  vm.currentUser;
  vm.greeting = "Hello there";
  vm.loggedIn = false;

  //Check for cookies
  vm.checkLogin = function() {
    var checkLogin = $http.get('/check/login/');
    checkLogin.then(function(response) {
      if (response.data === "fail") {
        $('#loginModal').modal('show');
      } else {
        vm.loggedIn = true;
        vm.currentUser = response.data.user;
      }
    })
  }

  //Check db for user
  vm.login = function(user) {
    var sendLogin = $http.get('/check/login/' + user);
    sendLogin.then(function(response) {
      if (response.data.found === true) {
        vm.currentUser = response.data.user;
        $('#continueModal').modal('show');
      } else {
        vm.addUser(user);
      }
    })
  }

  //Add a user
  vm.addUser = function(user) {
    var login = {}
    login.name = user;
    var added = $http.post('/login/', login);
    added.then(function(response) {
      vm.checkLogin();
    })
  }

  //Delete a user
  vm.removeUser = function(user) {
    var removed = $http.delete('/login/' + user);
    removed.then(function(response) {
      vm.addUser(user);
    })
  }
}


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
      var retryWord = $http.post('/game/', repeat);
      retryWord.then(function(info) {
        vm.word = info.data;
        vm.lastWord = vm.word.word;
        vm.letters = info.data.wordArray;
      })
    } else {
      var newWord = $http.get('/game/');
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
  vm.playAgain = function(word) {
    vm.inputAnswer = [];
    if (word !== undefined) {
      getGame(word);
    } else {
      getGame();
    }
  }
}
