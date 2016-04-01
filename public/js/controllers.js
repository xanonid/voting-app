'use strict';

/* Controllers */

angular.module('votingApp.controllers', ['chart.js'])
  // define controller:
  .controller('VotingAppCtrl', function ($scope, $http,$resource,$stateParams) {
    
    $scope.filter_owner=$stateParams.id;

    $http({
      method: 'GET',
      url: '/api/name'
    }).
    success(function (data, status, headers, config) {
      $scope.name = data.name;
    }).
    error(function (data, status, headers, config) {
      $scope.name = 'Error!';
    });
    
    $scope.dataIsLoaded=false;
    
    var polls=$resource("/polls/:id",{"id":"@_id"});
    
    this.polls = polls.query(function(){
      $scope.dataIsLoaded=true;
    });

  }).
  controller('PollCtrl', function ($scope,$stateParams,$resource,$http,$sanitize,$state) {
    var polls=$resource("/polls/:id",{"id":"@_id"});
    
    $scope.dataIsLoaded=false;
    var updateData=function()
    {
      $scope.id = $stateParams.id;    
      var cur_poll=polls.get({id:$stateParams.id},function(data)
      {
        $scope.title=$sanitize(data.title);
        $scope.owner=$sanitize(data.owner);
        $scope.page_title="Poll " + $sanitize(data.title);
        $scope.options=cur_poll.options;
        $scope.chartdata=[];
        $scope.chartlabels=[];
        if ($scope.options) {
          for (var i = 0; i < ($scope.options.length || 0); i++) {
            $scope.chartdata.push(parseInt($scope.options[i].votes,10) || 0);
            $scope.chartlabels.push(escapeHtml($scope.options[i].title) || "");
          }
        }
        $scope.dataIsLoaded=true;
      }
      );
      $scope.newoption="";
    };
    updateData();
    $scope.addNewOption=function(){
      if($scope.newoption.length>0)
      {
        $http.put("/polls/"+$scope.id+"/addOption",{title:$scope.newoption}).then(
          function(response){
            updateData();
          },function(response){
            if(response.status==409)
              $scope.alerts.push({"msg":"Option exists already.","type":"warning"});
            else
              $scope.alerts.push({"msg":"You need to login to add new option.","type":"warning"});
          });
      }
    };
    
    $scope.vote=function(id){
        $scope.options.forEach(function(i){
          if(i._id==id)
						i.votes=1 + (i.votes || 0);
        });
        $http.put("/polls/"+$scope.id+"/vote",{optionID:id}).then(
          function(){
            $scope.alerts.push({"msg":"Thanks for voting!","type":"success"});
            updateData();
          },function(err){
            console.log(err);
            if(err.status==403)
              $scope.alerts.push({"msg":"You have already voted.","type":"warning"});
            else
              $scope.alerts.push({"msg":"You vote seemd to be invalid.","type":"danger"});
            updateData();
          });
      };
      
      $scope.deletePoll=function()
      {
        var ask=confirm("Are you sure?");
        if(ask)
        {
          $http.delete("/polls/"+$scope.id).then(function(){
            $scope.alerts.push({"msg":"Poll deleted.","type":"success"});
            $state.go("home");
          },
          function(err){
            console.log(err);
            $scope.alerts.push({"msg":"Could not delete this poll.","type":"warning"});
          }
          );
        }
      };

      $scope.onChartClick=function(points,evt){
        if(points && points.length>0)
        {
          $scope.vote($scope.options[$scope.chartlabels.indexOf(points[0].label)]._id);
        }
      };

  }).
  controller('NewPollCtrl', function ($scope,$http,$state) {
    $scope.pollTitle="";
    $scope.pollOptions="";
    $scope.addPoll=function(){
            $http.post("/polls",{title:$scope.pollTitle,options:$scope.pollOptions}).then(
          function(response){
             $state.go('poll',{id:response.data._id});
          },function(response){
            $scope.alerts.push({"msg":"There was an error: "+response.data,"type":"danger"});
          });
    };
  });
  
  
  // escape service from https://github.com/janl/mustache.js/blob/ba510eb3549e5c7e673fd262e87f2a8027e03237/mustache.js#L47-L60
    var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }