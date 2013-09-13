define([
	'jquery',
	'underscore',
	'backbone',
	'collection/center_collection',
	'collection/cyquery_collection',
	'leaflet'

	], function($, _, Backbone, Centers, Companys) {

		var companyView = Backbone.View.extend({

			el: 'body',

			initialize: function () {
				this._map = map

				var centers = new Centers();
				var companys = new Companys();
				this._centers = centers;
				this._companys = companys;

				map.on('drag', function(e) {
					centers.add({center: map.getCenter()})
				})

				this.listenTo(centers, 'add', this.addCenter);
				this.listenTo(companys, 'add', this.addCompany);

			},

			addlocateCenter: function (data) {
				var lat = data.center.lat;
				var lng = data.center.lng;

				this._companys.url = '/lng/' + lng + '/lat/' + lat + '/radius/500';
				this._companys.fetch();
			},

			addCenter: function () {
				var center = this._centers.pop();
				var lat = center.attributes.center.lat;
				var lng = center.attributes.center.lng;

				this._companys.url = '/lng/' + lng + '/lat/' + lat + '/radius/100';
				this._companys.fetch();
			},

			addCompany: function () {
				var company = this._companys.pop().attributes;
				var company_name = company.name;
				var company_taxid = company.taxid;
				var company_lng = company.geography.coordinates[0];
				var company_lat = company.geography.coordinates[1];

				var marker = L.marker(L.latLng(company_lat, company_lng), { title: company_name });
				// add popup
				marker.bindPopup(company_name + ' (' + company_taxid + ' )');
				// add new layer to map
				this._map.addLayer(marker);
			}

		});

		return companyView;

	})