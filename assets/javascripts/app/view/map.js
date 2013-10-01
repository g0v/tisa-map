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

        new L.Control.GeoSearch({
            provider: new L.GeoSearch.Provider.OpenStreetMap()
        }).addTo(this.map);

        L.tileLayer(
            'http://{s}.tile.cloudmade.com/f59941c17eda4947ae395e907fe531a3/997/256/{z}/{x}/{y}.png',
            { maxZoom: 18, }
        ).addTo(this.map);

        this.map.addControl(new L.Control.Zoom({ position: 'bottomleft' }));
    },
    userLocation: function () {
            var option = this.location.pop().attributes.latlng;
            var setplace = [option.coords.latitude, option.coords.longitude];
            this.map.setView(setplace, 13);
            L.marker(setplace).addTo(this.map).bindPopup("<b>你現在在這！</b>").openPopup();
            this._company_view.addlocateCenter({center: {lat: option.coords.latitude, lng: option.coords.longitude}})
    },
});

