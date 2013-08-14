define([
	'jquery',
	'underscore',
	'backbone',
	'handlebars',
	'text!template/ly.html',
	'collection/ly_collection',
	'collection/person_collection'

	], function($, _, Backbone, Handlebars, lyTemplate, lysCollection, personCollection) {

	var lyView = Backbone.View.extend({

		el: '#ly_list_area',

		initialize: function() {
			this.listenTo(personCollection, 'reset', this.filterPerson())
		},

		render: function(ly_arr) {
			// get JSON from model
			var source = lyTemplate;
			var template = Handlebars.compile(source);
			var html = '';
			for (var i = ly_arr.length - 1; i >= 0; i--) {
		        if(ly_arr[i].party  === 'KMT') {
		            ly_arr[i].party = '國民黨';
		        }

		        html += template(ly_arr[i]);
		    };

			this.$el.html(html);
		},

		filterPerson: function() {
			var lyArr = lysCollection.filterPeople(personCollection.pop().attributes);
			this.render(lyArr);
		}

	})

	return lyView;


})