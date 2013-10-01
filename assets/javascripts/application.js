//= require app
//= require_tree ./app/model
//= require_tree ./app/collection
//= require_tree ./app/view
//= require_tree .

$(document).ready(function() {
    new App.View.Map();
});
