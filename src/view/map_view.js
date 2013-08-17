define([

	'jquery',
	'underscore',
	'backbone',
	'model/locate_model',
	'model/member_model',
	'topojson',
	'geosearch',
	'geosearch_provider',
	'leaflet',
	'leaflet_cluster'

	], function($, _, Backbone, LocateModel, MemberModel) {

		var mapView = Backbone.View.extend({

			initialize: function  () {
				var map = this.newMap();
				var locateModel = new LocateModel();
				locateModel.startLocate();
				this.map = map;
				this.locateModel = locateModel;
				this.addGeocode(map);
				this.tailLayer(map);
				this.addTown(map);
				this.addmapControl(map);
				this.listenTo(locateModel, 'change:latlng', this.userLocation);
			},

			newMap: function () {

				map = L.map('map', {
					zoomControl: false,
					attributionControl: false
				});

				return map;
 
			},

			addGeocode: function (map) {
				geocoder = new L.Control.GeoSearch({
					provider: new L.GeoSearch.Provider.OpenStreetMap()
				}).addTo(map);
			},

			tailLayer: function (map) {
				L.tileLayer('http://{s}.tile.cloudmade.com/f59941c17eda4947ae395e907fe531a3/997/256/{z}/{x}/{y}.png', {
				maxZoom: 18,
				}).addTo(map);
			},

			addTown: function (map) {
				
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

			addmapControl: function (map) {
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

			listMember: function () {
				var memberModel = new MemeberModel();
				var peopleArr = memberModel.addMemeber();

				var markers = L.markerClusterGroup({ disableClusteringAtZoom: 17 });

		    // loop through users
		    for (var i = 0; i < peopleArr.length; i++) {
		        var a = peopleArr[i];
		        var title = a[2];
		        var name = a[3];
		        var lat_val = a[0] || 24;
		        var lng_val = a[1] || 121;
		        var marker = L.marker(L.latLng(lat_val, lng_val), { title: title });

		        // add popup
		        marker.bindPopup('<img src="' + title + '" width="50"><br>' + name);

		        // add new layer to map
		        markers.addLayer(marker);
		    }

		    map.addLayer(markers);
			}


		});

		return mapView;	
	})