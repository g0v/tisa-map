var ly_arr = [];

function get_person(callback) {
  $.getJSON('../json_data/tisa-person.json', function (ly_data) {
    var ly_data = ly_data;


    $.getJSON('../json_data/mly-8.json', function (data) {

      for (var i = ly_data.length - 1; i >= 0; i--) {

        for (var j = data.length - 1; j >= 0; j--) {
          if(data[j].name === ly_data[i]) {
            ly_arr.push(data[j])
          }
        };

      };
      callback(ly_arr);
    });
  });
}

window.app = angular.module('tisa', [])

function lyCtrl($scope) {
  get_person(function (data) {
    $scope.$apply(function () {
      $scope.lys = data;
    });
  });
}
