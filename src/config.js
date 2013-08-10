require.config({
	baseUrl: '/src',

	paths: {

      'jquery'          : '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
      'underscore'      : '/script/vendor/underscore-min',
      'backbone'        : '/script/vendor/backbone-min',
      'firebase'        : '//cdn.firebase.com/v0/firebase',
      'firebase_login'  : '//cdn.firebase.com/v0/firebase-simple-login',
      'leaflet'         : '//cdn.leafletjs.com/leaflet-0.5/leaflet',
      'leaflet_cluster' : '/script/markercluster/leaflet.markercluster',
      'avatars'         : '/script/vendor/avatars.io.min',
      'handlebars'      : '/script/vendor/handlebars',
      'jquery.countdown': '/script/vendor/jquery.countdown',
      'topojson'        : '/script/vendor/topojson',
      'geosearch'       : '/script/geosearch_js/l.control.geosearch',
      'geosearch_provider': '/script/geosearch_js/l.geosearch.provider.openstreetmap'

   },
   shim: {
      'underscore': {
        exports: '_'
      },

      'backbone': {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
      },

      'firebase_login': {
        deps: ['firebase']
      },

      'leaflet': {
        deps: ['jquery']
      },

      'jquery.countdown': {
        deps: ['jquery']
      },

      'geosearch': {
        deps: ['jquery', 'leaflet']
      },

      'geosearch_provider': {
        deps: ['jquery', 'leaflet', 'geosearch']
      }

   }
});
