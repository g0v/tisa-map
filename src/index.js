require(["config"], function(config) {

  require([
  	'jquery',
  	'underscore',
  	'backbone',
    'src/script/view/index_view',
  	'src/script/model/index_model',
  	], function($, _, Backbone, IndexModel, IndexView){
      'use strict';
      // render index out view
      var indexModel = new IndexModel;
  		var indexView = new IndexView({model: indexModel});
  	}
  )

})