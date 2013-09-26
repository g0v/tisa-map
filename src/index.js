require(["config"], function(config) {
require([
'jquery',
'underscore',
'backbone',
'view/map_view',
'view/company_view',
'/assets/application.js',
], function($, _, Backbone, MapView, CompanyView, AuthView){
    'use strict';
    var mapView = new MapView();
    var companyView = new CompanyView();
})
})
