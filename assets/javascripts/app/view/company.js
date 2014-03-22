App.View.Company = Backbone.View.extend({
    el: 'body',
    initialize: function (options) {
        this.marker_arr = []
        this.map = options.map;
        this.centers = new App.Collection.Center();
        this.companys = new App.Collection.Company();

        // add center when drag
        this.map.on('drag', function(e) {
                this.centers.add({center: this.map.getCenter()})
        }, this);

        // listen to center, company add action.
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
        var parse_geo = JSON.parse(company.location)
        var company_lng = parse_geo.coordinates[0];
        var company_lat = parse_geo.coordinates[1];
        var marker = L.marker(L.latLng(company_lat, company_lng), { title: company_name });
        // add popup
        marker.bindPopup(company_name + ' (' + company_taxid + ' )');
        // add markers to map
        this.marker_arr.push(marker)
        this._remakeMarkers();
    },
    _addMarkerCluster: function() {
        var markers = L.markerClusterGroup( { disableClusteringAtZoom: 17 } );
        return markers
    },
    _remakeMarkers: function() {
        var markers = this._addMarkerCluster();
        console.log(this.marker_arr);
        _.each(this.marker_arr, function(marker) {
            markers.addLayer(marker);
            console.log(marker);
        })
        console.log(markers);
        this.map.addLayer(markers);
    }
});

