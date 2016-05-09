var app = angular.module('spellBound');

app.controller('homeController', home);

app.$inject = ['$http'];

function home($http) {
  var vm = this;
  vm.currentUser;
  vm.gameboard = false;

  //Query user
  vm.login = function(user) {
    if (user) {
      var sendLogin = $http.get('/login/' + user);
    } else {
      var sendLogin = $http.get('/login/');
    }
    sendLogin.then(function(response) {
      if (response.data.verify !== 'fail') {
        if (response.data.nameExists === true) {
          $('#existsModal').modal('show');
        }
        else if (response.data.verify === "pass") {
          vm.gameboard = true;
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
      vm.gameboard = true;
      vm.currentUser = response.data.name;
    })
  }
}
