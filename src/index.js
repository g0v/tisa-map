require(["config"], function(config) {
require([
'jquery',
'underscore',
'backbone',
'view/map_view',
'/assets/application.js',
], function($, _, Backbone, MapView){
    'use strict';
    var mapView = new MapView();
})
})
