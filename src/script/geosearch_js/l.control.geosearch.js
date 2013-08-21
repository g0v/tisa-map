L.GeoSearch = {};
L.GeoSearch.Provider = {};

// MSIE needs cors support
jQuery.support.cors = true;

L.GeoSearch.Result = function (x, y, label) {
	this.X = x;
	this.Y = y;
	this.Label = label;
};

L.Control.GeoSearch = L.Control.extend({
	options: {
		position: 'topcenter'
	},

	initialize: function (options) {
		this._config = {};
		this.setConfig(options);
	},

	setConfig: function (options) {
		this._config = {
			'country': options.country || '',
			'provider': options.provider,
			
			'searchLabel': options.searchLabel || '在這輸入你想要搜尋的地方...',
			'notFoundMessage' : options.notFoundMessage || '對不起，此地址查詢不到。',
			'messageHideDelay': options.messageHideDelay || 3000,
			'zoomLevel': options.zoomLevel || 18
		};
	},

	onAdd: function (map) {
		var $controlContainer = $(map._controlContainer);

		if ($controlContainer.children('.leaflet-top.leaflet-center').length == 0) {
			$controlContainer.append('<div class="leaflet-top leaflet-center"></div>');
			map._controlCorners.topcenter = $controlContainer.children('.leaflet-top.leaflet-center').first()[0];
		}

		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-geosearch');

		var searchbox = document.createElement('input');
		searchbox.id = 'leaflet-control-geosearch-qry';
		searchbox.type = 'text';
		searchbox.placeholder = this._config.searchLabel;
		this._searchbox = searchbox;

		var msgbox = document.createElement('div');
		msgbox.id = 'leaflet-control-geosearch-msg';
		msgbox.className = 'leaflet-control-geosearch-msg';
		this._msgbox = msgbox;

		var selectOption = ""
		selectOption = "<select id='leaflet-control-geosearch-select' class='leaflet-control-geosearch-select'>"
					+ "<option value='site'>地點搜尋</option>"
					+ "<option value='company'>公司搜尋</option>"
					+ "<option value='id'>統編搜尋</option"
					+ "</select>"
		this._selectOption = selectOption;

		var resultslist = document.createElement('ul');
		resultslist.id = 'leaflet-control-geosearch-results';
		this._resultslist = resultslist;

		$(this._msgbox).append(this._resultslist);
		$(this._container).append(this._searchbox, this._msgbox, this._selectOption);

		L.DomEvent
		  .addListener(this._container, 'click', L.DomEvent.stop)
		  .addListener(this._container, 'keypress', this._onKeyUp, this);

		L.DomEvent.disableClickPropagation(this._container);

		return this._container;
	},
	
	geosearch: function (qry) {
	  var provider = this._config.provider;
	  var url = provider.GetServiceUrl(qry);
	  if (!('XDomainRequest' in window && window.XDomainRequest)) {

		try {
		  $.getJSON(url, function (data) {
			try {
			  this._handleSuccess(data);
			}
			catch (error) {
			  this._printError(error);
			}
		  }.bind(this));
		}
		catch (error) {
		  this._printError(error);
		}
	  } else {
		// Use Microsoft XDR
		var xdr = new XDomainRequest();
		xdr.open("get", url);
		xdr.onload = function () {
		  try {
			var data = jQuery.parseJSON(xdr.responseText); // we must parse response from XDR object
			this._handleSuccess(data);
		  } catch (error) {
			this._printError(error);
		  }
		}.bind(this);
		xdr.onerror = function () {
		  this._printError(xdr.responseText);
		}.bind(this);
		xdr.send();

	  }
	},

	companysearch: function (value) {

		var _this = this;
		$.get('/name/' + value, function(data) {
		  if(data) {
		  	_this._apisearchSuccess(data)
		  } else {
		  	_this._printError('對不起，沒有此筆公司資料')
		  }
		});
		
	},

	idsearch: function (value) {
		var _this = this;
		$.get('/taxid/' + value, function(data) {
		  if(data) {
		  	_this._apisearchSuccess(data)
		  } else {
		  	_this._printError('對不起，沒有此筆統編資料')
		  }
		});
		
	},

	_apisearchSuccess: function (data) {
		var company = data.name + ' ( 統編：' + data.taxid + ' )';
		var geolat = data.geography.coordinates[0];
		var geolng = data.geography.coordinates[1];

		this._showLocation(geolat, geolng, company)
	},

	_handleSuccess: function (data) {
	  var results = this._config.provider.ParseJSON(data);
	  if (results.length == 0)
		throw this._config.notFoundMessage;
	  this._showLocation(results[0].X, results[0].Y, results[0].Label);
	},

	_showLocation: function (x, y, label) {
		if (typeof this._positionMarker === 'undefined')
			this._positionMarker = L.marker([y, x]).addTo(this._map).bindPopup(label).openPopup();
		else
			this._positionMarker.setLatLng([y, x]).bindPopup(label).openPopup();

		this._map.setView([y, x], this._config.zoomLevel, false);
	},

	_printError: function(message) {
		$(this._resultslist)
			.html('<li>'+message+'</li>')
			.fadeIn('slow').delay(this._config.messageHideDelay).fadeOut('slow',
					function () { $(this).html(''); });
	},
	
	_onKeyUp: function (e) {
		var escapeKey = 27;
		var enterKey = 13;

		if (e.keyCode === escapeKey) {
			$('#leaflet-control-geosearch-qry').val('');
			$(this._map._container).focus();
		}
		else if (e.keyCode === enterKey) {

			var selected_val = $('#leaflet-control-geosearch-select').val();
			var query_val = $('#leaflet-control-geosearch-qry').val();
			if(selected_val === 'site') {
				this.geosearch(query_val);
			}else if(selected_val === 'company') {
				this.companysearch(query_val);
			}else if(selected_val === 'id') {
				this.idsearch(query_val);
			}
		}
	}
});
