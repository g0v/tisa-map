require(["config"], function(config) {

  require([
  	'jquery',
  	'underscore',
  	'backbone',
    // 'src/script/model/index_model',
    'ajax/ly_8',
    'ajax/tisa_person',
    'view/ly_view',
    'view/index_view',
  	
  	], function($, _, Backbone, ajaxLy, ajaxTisa, LyView, IndexView){
      'use strict';
      
      // render index out view
      // var indexModel = new IndexModel;
      var lyView = new LyView();
  		var indexView = new IndexView();
  	}
  )

})