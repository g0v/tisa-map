require(["config"], function(config) {

  require([
  	'jquery',
  	'underscore',
  	'backbone',
    'ajax/ly_8',
    'ajax/tisa_person',
    'view/map_view',
    'view/auth_view',
    'view/ly_view',
    'view/index_view',
  	
  	], function($, _, Backbone, ajaxLy, ajaxTisa, MapView, AuthView, LyView, IndexView){
      'use strict';
      
      // render index out view
      var mapView = new MapView();
      var authView = new AuthView();
      var lyView = new LyView();
  		var indexView = new IndexView();
  	}
  )

})