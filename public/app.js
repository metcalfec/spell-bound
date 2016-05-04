var app = angular.module('spellBound', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when("/game", {
    templateUrl: "/game/game.view.html",
    controller: "gameController",
    controllerAs: "game"
  })
}]);
