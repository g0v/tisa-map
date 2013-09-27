define([
	'jquery',
	'underscore',
	'backbone',
	'leaflet'

	], function($, _, Backbone) {

                var CenterModel = Backbone.Model.extend({
                });
                var CenterCollection = Backbone.Collection.extend({
                    model: CenterModel,
                });
                var CompanyModel = Backbone.Model.extend({
                });
                var CompanyCollection = Backbone.Collection.extend({
                        model: CompanyModel,
                });

		var companyView = Backbone.View.extend({

			el: 'body',

			initialize: function (options) {
				this.map = options.map;

				this.centers = new CenterCollection();
				this.companys = new CompanyCollection();

				this.map.on('drag', function(e) {
					this.centers.add({center: this.map.getCenter()})
				}, this);

				this.listenTo(this.centers, 'add', this.addCenter);
				this.listenTo(this.companys, 'add', this.addCompany);

			},

			addlocateCenter: function (data) {
				var lat = data.center.lat;
				var lng = data.center.lng;

				this.companys.url = '/lng/' + lng + '/lat/' + lat + '/radius/500';
				this.companys.fetch();
			},

			addCenter: function () {
				var center = this.centers.pop();
				var lat = center.attributes.center.lat;
				var lng = center.attributes.center.lng;

				this.companys.url = '/lng/' + lng + '/lat/' + lat + '/radius/100';
				this.companys.fetch();
			},

			addCompany: function () {
				var company = this.companys.pop().attributes;
				var company_name = company.name;
				var company_taxid = company.taxid;
				var company_lng = company.geography.coordinates[0];
				var company_lat = company.geography.coordinates[1];

				var marker = L.marker(L.latLng(company_lat, company_lng), { title: company_name });
				// add popup
				marker.bindPopup(company_name + ' (' + company_taxid + ' )');
				this.map.addLayer(marker);
			}

		});

		return companyView;

	})
