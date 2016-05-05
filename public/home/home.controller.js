var app = angular.module('spellBound');

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
