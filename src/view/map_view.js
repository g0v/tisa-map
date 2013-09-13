define([

	'jquery',
	'underscore',
	'backbone',
	'collection/locate_collection',
	'view/company_view',
	// 'collection/member_collection',
	'topojson',
	'geosearch',
	'geosearch_provider',
	'leaflet',
	'leaflet_cluster'

	], function($, _, Backbone, LocateCollection, CompanyView) {

		var mapView = Backbone.View.extend({

			initialize: function  () {
				var map = this.newMap();

				var location = new LocateCollection();
				var company_view = new CompanyView();
				this._company_view = company_view;
				// var members = new MemberCollection();
				var markers = L.markerClusterGroup();

				this.listenTo(location, 'add', this.userLocation)
				// this.listenTo(members, 'add', this.markMember)
				this.location = location;
				this.startLocate();

				this.map = map;
				this.markers = markers;
				this.addGeocode();
				this.tailLayer();
				this.addTown();
				this.addmapControl();

				
				// this.members = members;
				// this.addMember(members);

				
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

			startLocate: function () {
				this.location.startLocate();	
			},

			userLocation: function () {
				var map = this.map;
				var option = this.location.pop().attributes.latlng;
				var setplace = [];
				
				setplace.push(option.coords.latitude);
				setplace.push(option.coords.longitude);
				this.setplace = setplace;
				map.setView(setplace, 13);
				L.marker(setplace).addTo(map).bindPopup("<b>你現在在這！</b>").openPopup();
				this._company_view.addlocateCenter({center: {lat: option.coords.latitude, lng: option.coords.longitude}})
			},

			// addMember: function () {
			// 	this.members.addMember();
			// },

			markMember: function () {
				
				var user = this.members.pop().attributes.user;

				if(!user.latlng) {
					user.latlng = []
				}

				lat_val  = user.latlng[0] || 24;
				lng_val  = user.latlng[1] || 121;
				var marker = L.marker(L.latLng(lat_val, lng_val), { title: user.avatar });
				// add popup
				marker.bindPopup('<img src="' + user.avatar + '" width="50"><br>' + user.displayName);
				// add new layer to map
				this.markers.addLayer(marker);
				this.map.addLayer(this.markers);
				
			}


		});

		return mapView;	
	})