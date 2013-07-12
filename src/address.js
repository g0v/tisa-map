var constituency, tw3166, ctvToConstituency, addressToConstituency, input, legislator, mly8, position;
var ctvToConstituency, addressToConstituency, getLegislator;

function finding() {

$.getJSON('../json_data/ly-section.json', function(constituency_g){
  return $.getJSON('../json_data/3166-2-tw.json', function(tw3166_g){
	  return $.getJSON('../json_data/legislator.json', function(legislator_g){
		return $.getJSON('../json_data/mly-8.json', function(mly8_g){
				return $.getJSON('../json_data/position.json', function(position_g){


constituency = constituency_g;
tw3166 = tw3166_g;
legislator = legislator_g;
mly8 = mly8_g;
position = position_g;

ctvToConstituency = function(county, town, village){
		//alert(county+town+village);

  var c, name, area, list, which, matched, res$, ref$;
  c = (function(){
    var ref$, res$;
    var results$ = [];
    for (c in ref$ = tw3166) {
      name = ref$[c];
      if (name === county) {
        results$.push(c);
      }
    }
    return results$;
  }())[0];
  
  if (constituency[c].length === 1) {
    return [c, 0];
  }

  village = null;
  which = (function(){
    var ref$, results$ = [];
    for (area in ref$ = constituency[c]) {
      list = ref$[area];
      if (in$(town + "-" + village, list)) {
        results$.push(area);
      }
    }
    return results$;
  }())[0];
  if (!which) {
    res$ = [];
    for (area in ref$ = constituency[c]) {
      list = ref$[area];
      if (list.filter(fn$).length) {
        res$.push(area);
      }
    }
    matched = res$;
    if (matched.length !== 1) {
      //throw matched;
    }
    
    which = matched[0];
  }
  
  //var legi = legislator[c][which];
  
  var legi;
  legi = (function(){
		var a, res$, i$, len$, entry, ref$, cs, n;	
		res$ = [];
		for (i$ = 0, len$ = mly8.length; i$ < len$; ++i$) {
		  entry = mly8[i$], ref$ = entry.constituency, cs = ref$[0], n = ref$[1];
		  if (cs == c && n == which) {
		    res$.push(entry);
		    res$.push(i$);
		  }
		}
		return res$;
	}());
	return [c, which, legi];
  
  function fn$(it){
    return it.indexOf(town) === 0;
  }
};

addressToConstituency = function(input){
	//alert("input"+input);
  var address, types, res$, i$, len$, ref$, long_name, county, town, village;
  address = input['results'][0]['address_components'];
  res$ = {};
  for (i$ = 0, len$ = address.length; i$ < len$; ++i$) {
    ref$ = address[i$], long_name = ref$.long_name, types = ref$.types;
    res$[types[0]] = long_name;
  }
  types = res$;
  ref$ = [types['administrative_area_level_2'], types['locality'], types['sublocality']], county = ref$[0], town = ref$[1], village = ref$[2];
  
  return ctvToConstituency(county, town, village);
};

mapServiceProvider_done(lat, longti);
				
				});
			});
	  	});
	});
});	

}

//console.log(addressToConstituency(input));

function in$(x, arr){
  var i = -1, l = arr.length >>> 0;
  while (++i < l) if (x === arr[i] && i in arr) return true;
  return false;
}