'use strict';

var votingApp = angular.module('votingApp', [
  'votingApp.controllers',
  'ui.router',
  'ui.bootstrap',
  'ngResource',
  'ngCookies',
  'chart.js',
  'ngSanitize'
])

 // states:
.config(function ( $stateProvider, $urlRouterProvider) {
  
  

   $urlRouterProvider.otherwise("/home");
   
   $stateProvider.state('home', {
     url:"/home?id",
    templateUrl: 'partials/home'
    })
    .state('poll', {
      url:"/poll/:id",
      templateUrl: 'partials/poll',
      controller:"PollCtrl"
    })
    .state('login', {
      url:"/login",
      templateUrl: 'partials/login'
    })
    .state('mypolls', {
      url:"/mypolls",
      templateUrl: 'partials/mypolls',
      //controller:"MyPollsCtrl"
    })
    .state('newpoll', {
      url:"/newpoll",
      templateUrl: 'partials/newpoll',
      controller:"NewPollCtrl"
    });

   }).run(function($http, $cookies,$rootScope){
     
     $rootScope.$on('$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams, options){ 
        //remove alerts on state change
        $rootScope.alerts=[];
      });
});