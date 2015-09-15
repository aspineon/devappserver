var appModule = angular.module('sampleApp', []);

appModule.controller('MainCtrl', ['$scope','$http', '$interval',
    function($scope, $http, $interval) {
        var url1 = '/api/ipify/org';
        var url2 = '/api/ipify/org';

        function update() {
            $http.get(url1).then(function(response) {
                $scope.ip1 = response.data.ip;
            });

            $http.get(url2).then(function(response) {
                $scope.ip2 = response.data.ip;
            });
        }

        $interval(update, 1000);
    } ]);
