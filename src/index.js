require(["config"], function(config) {


  require([
  	'jquery',
  	'underscore',
  	'backbone',
    // 'src/script/model/index_model',
    'view/index_view',
  	
  	], function($, _, Backbone, IndexView){
      'use strict';
      console.log($);
      console.log(_);
      console.log(Backbone);
      console.log(IndexView);
      // render index out view
      // var indexModel = new IndexModel;
  		var indexView = new IndexView();
  	}
  )

})