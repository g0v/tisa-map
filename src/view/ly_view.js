define([
	'jquery',
	'underscore',
	'backbone',
	'text!template/ly.html',
	'collection/ly_collection',
	'collection/person_collection'

	], function($, _, Backbone, lyTemplate, lysCollection, personCollection) {

	var lyView = Backbone.View.extend({

		el: '#ly_list_area',

		//template: _.template(lyTemplate),

		initialize: function() {
			this.listenTo(personCollection, 'reset', this.filterPerson())
		},

		render: function() {
			// get JSON from model
			console.log('render')
		},

		filterPerson: function() {
			var lyArr = lysCollection.filterPeople(personCollection.pop().attributes);

			console.log(lyArr);
		}



	})

	return lyView;


})