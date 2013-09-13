require(["config"], function(config) {

  require([
  	'jquery',
  	'underscore',
  	'backbone',
    'ajax/ly_8',
    'ajax/tisa_person',
    'view/map_view',
    'view/company_view',
    'view/auth_view',
    'view/ly_view',
    '/assets/application.js',
    'script/vendor/scroll-top'
  ], function($, _, Backbone, ajaxLy, ajaxTisa, MapView, CompanyView, AuthView, LyView){
      'use strict';
      
      // render index out view
      var mapView = new MapView();
      var companyView = new CompanyView();
      //var authView = new AuthView();
      var lyView = new LyView();
  	}
  )

})
