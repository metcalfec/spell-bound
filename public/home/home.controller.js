var app = angular.module('spellBound');

app.controller('homeController', home);

app.$inject = ['$http'];

function home($http) {
  var vm = this;
  vm.currentUser;
  vm.greeting = "Hello there";
  vm.loggedIn = false;

  //Query user
  vm.login = function(user) {
    if (user !== undefined) {
      var sendLogin = $http.get('/check/login/' + user);
    } else {
      var sendLogin = $http.get('/check/login/');
    }
    sendLogin.then(function(response) {
      if (response.data !== 'fail') {
        if (response.data === true) {
          console.log("Please pick another name")
        }
        else if (response.data.verify === "pass") {
          vm.loggedIn = true;
          vm.currentUser = response.data.user;
        } else {
          vm.addUser(user);
        }
      } else {
        $('#loginModal').modal('show');
      }
    })
  }

  //Add a user
  vm.addUser = function(user) {
    var newUser = {}
    newUser.name = user;
    var added = $http.post('/user/', newUser);
    added.then(function(response) {
      vm.loggedIn = true;
      vm.currentUser = response.data.user;
    })
  }
}
