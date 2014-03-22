App.View.Map = Backbone.View.extend({
    initialize: function  () {
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        });

        this.location = new App.Collection.Location();
        this._company_view = new App.View.Company({ map: this.map });

        this.listenTo(this.location, 'add', this.userLocation)
        this.location.startLocate();

        var init_geosearch = new L.Control.GeoSearch({
            provider: new L.GeoSearch.Provider.OpenStreetMap()
            , zoomLevel: 50
        })

        init_geosearch.addTo(this.map);

        L.tileLayer(
            'http://{s}.tile.cloudmade.com/f59941c17eda4947ae395e907fe531a3/997/256/{z}/{x}/{y}.png',
            { maxZoom: 50, }
        ).addTo(this.map);

        this.map.addControl(new L.Control.Zoom({ position: 'bottomleft' }));

        $('#leaflet-control-geosearch-submit').click(function() {
            var selected_val = $('#leaflet-control-geosearch-select').val();
            var query_val = $('#leaflet-control-geosearch-qry').val();
            if(selected_val === 'site') {
                init_geosearch.geosearch(query_val);
            }else if(selected_val === 'company') {
                init_geosearch.companysearch(query_val);
            }else if(selected_val === 'id') {
                init_geosearch.idsearch(query_val);
            }
        })

        if($('#tax-name').val() !== '') {
            init_geosearch.companysearch($('#tax-name').val());
        }
    },
    userLocation: function () {
        var option = this.location.pop().attributes.latlng;
        var setplace = [option.coords.latitude, option.coords.longitude];
        this.map.setView(setplace, 13);
        L.marker(setplace).addTo(this.map).bindPopup("<b>你現在在這！</b>").openPopup();
        this._company_view.addlocateCenter({center: {lat: option.coords.latitude, lng: option.coords.longitude}})
    },
});

