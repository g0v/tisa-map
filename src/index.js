require(["config"], function(config) {

  require([
  	'jquery',
  	'underscore',
  	'backbone',
    // 'src/script/model/index_model',
    'view/ly_view',
    'view/index_view',
  	
  	], function($, _, Backbone, LyView, IndexView){
      'use strict';
      
      // render index out view
      // var indexModel = new IndexModel;
      var lyView = new LyView();
  		var indexView = new IndexView();
  	}
  )

})