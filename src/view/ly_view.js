define([
	'jquery',
	'underscore',
	'backbone',
	'text!template/ly.html',
	'ajax/ly_8',
	'ajax/tisa_person',
	'collection/ly_collection'

	], function($, _, Backbone, tisaPerson, lyTemplate, lysCollection) {

	var lyView = Backbone.View.extend({

		el: '#ly_list_area',

		template: _.template(lyTemplate),

		initialize: function() {
			console.log(tisaPerson);
			//this.listenTo(lysCollection, 'add', this.render)
		},

		render: function() {
			// get JSON from model
			console.log('render')
			
		}

	})

	return lyView;


})