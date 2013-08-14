define([
	'jquery',
	'underscore',
	'backbone',
	'model/ly_model'
	], function($, _, Backbone, lyModel) {

	var lysCollection = Backbone.Collection.extend({

			model: lyModel,

			filterPeople: function(lyName) {
				lyArr = [];

				lyName = _.values(lyName);

				for(i = 0; i < this.models.length; i++) {
					for( j = 0; j < lyName.length; j++) {

						if(this.models[i]['attributes'].name === lyName[j]) {
							lyArr.push(this.models[i]['attributes']);
						}
					}
				}

				return lyArr;
			}

	});

	return new lysCollection();

});