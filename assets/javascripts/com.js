//= require 'lodash'
//= require 'bootstrap'
//= require 'jquery-ui-custom'

(function($){
  "use strict";

  var
  companyCache = {}, // Autocomplete cache
  lastXhr; // Autocomplete jqXHR object

  $('#autocomplete').autocomplete({
    source: function(query, resp){
      var term = query.term;

      if(lastXhr){
        lastXhr.abort();
      }
      if(companyCache[term]){
        resp(companyCache[term]);
      }
      lastXhr = $.getJSON('/com/complete/'+term, {}, function(data){
        companyCache[term] = data;
        resp(data);
      });
    },
    delay: 0,
    autoFocus: true,
    sortResults:false,
    matchSubset: false,
    maxItems: 6,
    select: function(event, ui) {
      window.location.href = '/com/company/' + ui.item.id;
    }
  });

  // Setting up autocomplete style
  var meta = $('#autocomplete').data('uiAutocomplete')
  if(meta){
    meta._renderItem = function(ul, item){
      var re = new RegExp("(" + this.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ")", "gi"),
        word = item.value.replace(re,"<b>$1</b>");

      return $( "<li></li>" )
        .data( "item.autocomplete", item )
        .append( "<a>" + word + "</a>" )
        .appendTo( ul );
    };
    meta._renderMenu = function(ul, items){
      var that = this;
      $.each(items, function(i, item){
        that._renderItemData(ul, item);
      });

      $(ul).addClass('dropdown-menu')
    }
  }

  // Result page slider toggle
  $('.js-slider-toggle').click(function(){
    $(this).parents('.js-slider-container').toggleClass('is-toggled');
  });

}(jQuery));