define([

	'jquery',
	'underscore',
	'backbone',
	'topojson',
	'geosearch',
	'geosearch_provider',
	'leaflet'

	], function($, _, Backbone) {

		var mapView = Backbone.View.extend({

			initialize: function  () {
				var map = this.newMap();
				this.addGeocode(map);
				this.tailLayer(map);
				this.addTown(map);
				this.addmapControl(map);
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
			}


		});

		return mapView;	
	})