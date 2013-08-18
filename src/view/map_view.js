define([

	'jquery',
	'underscore',
	'backbone',
	'model/locate_model',
	'collection/member_collection',
	'topojson',
	'geosearch',
	'geosearch_provider',
	'leaflet',
	'leaflet_cluster'

	], function($, _, Backbone, LocateModel, MemberCollection) {

		var mapView = Backbone.View.extend({

			initialize: function  () {
				var map = this.newMap();
				var locateModel = new LocateModel();
				locateModel.startLocate();
				this.map = map;
				this.locateModel = locateModel;
				this.addGeocode();
				this.tailLayer();
				this.addTown();
				this.addmapControl();

				var members = new MemberCollection();
				this.members = members;
				this.addMember();
				this.listenTo(locateModel, 'change:latlng', this.userLocation);
				this.listenTo(members, 'add', this.markMember)
			},

			newMap: function () {

				map = L.map('map', {
					zoomControl: false,
					attributionControl: false
				});

				return map;
 
			},

			addGeocode: function () {
				geocoder = new L.Control.GeoSearch({
					provider: new L.GeoSearch.Provider.OpenStreetMap()
				}).addTo(map);
			},

			tailLayer: function () {
				L.tileLayer('http://{s}.tile.cloudmade.com/f59941c17eda4947ae395e907fe531a3/997/256/{z}/{x}/{y}.png', {
				maxZoom: 18,
				}).addTo(map);
			},

			addTown: function () {
				
				var town_layer = L.geoJson(null, {
					style: {
						color: 'red',
						weight: 5,
						fill: 'red',
						opacity: 1,
						fillOpacity: 0.3
					},
					onEachFeature: function (feature, layer) {
						layer.bindPopup("<img src='" + feature.properties.avatar + "'/><br/>" + feature.properties.name + "<br/><a href='#" + feature.properties.name + "'>我要找他求救！</a>");
					}
				});

				$.getJSON('./json_data/tisa-ly-map.json', function (data) {
					var town_geojson = topojson.feature(data, data.objects["twVote1982.geo"]);
					town_layer.addData(town_geojson);
				});

				// set initial map view

				map.setView(['24', '121'], 7).addLayer(town_layer);
			},

			addmapControl: function () {
				map.addControl(new L.Control.Zoom({ position: 'bottomleft' }));
			},

			userLocation: function () {

				var map = this.map;
				var option = this.locateModel.get('latlng');
				var setplace = [];
				
				setplace.push(option.coords.latitude);
				setplace.push(option.coords.longitude);
				this.setplace = setplace;
				map.setView(setplace, 13);
				L.marker(setplace).addTo(map).bindPopup("<b>你現在在這！</b>").openPopup();
			},

			addMember: function () {
				this.members.addMember();
			},

			markMember: function () {
				var markers = L.markerClusterGroup({ disableClusteringAtZoom: 17 });
		    var user = this.members.pop().attributes.user;

		    lat_val  = '121';
		    lng_val  = '24';

        var marker = L.marker(L.latLng(lat_val, lng_val), { title: user.displayName });

        // add popup
        marker.bindPopup('<img src="' + user.avatar + '" width="50"><br>' + user.displayName);

        // add new layer to map
        markers.addLayer(marker);
		   
		    this.map.addLayer(markers);
				
			}


		});

		return mapView;	
	})