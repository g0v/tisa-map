require(["config"], function(config) {

  require([
  	'jquery',
  	'underscore',
  	'backbone',
    'ajax/ly_8',
    'ajax/tisa_person',
    'view/ly_view',
    'view/index_view',
  	
  	], function($, _, Backbone, ajaxLy, ajaxTisa, LyView, IndexView){
      'use strict';
      
      // render index out view
      var lyView = new LyView();
  		var indexView = new IndexView();
  	}
  )

})