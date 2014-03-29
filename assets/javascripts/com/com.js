//= require ../bootstrap
//= require ../jquery-ui-custom

(function($){
  "use strict";

  var
  companyCache = {}, // Autocomplete cache
  lastXhr, // Autocomplete jqXHR object
  isCompositing = false; // Currently in IME composition mode.

  $('#autocomplete').autocomplete({
    source: function(query, resp){
      var term = query.term;

      if(lastXhr){
        lastXhr.abort();
      }
      if(companyCache[term]){
        resp(companyCache[term]);
      }
      lastXhr = $.getJSON('/complete/'+term, {}).done(function(data){
        companyCache[term] = data;
        resp(data);
      }).fail(function(){
        resp();
      });
    },
    delay: 0,
    autoFocus: true,
    sortResults:false,
    matchSubset: false,
    select: function(event, ui) {
      window.location.href = '/company/' + ui.item.id;
    }
  }).on('compositionstart', function(data) {
    isCompositing = true;

  }).on('compositionend', function() {
    var $this = $(this);
    isCompositing = false;

    // Trigger search manually when IME composition ended.
    setTimeout(function(){
      $this.autocomplete('search');
    }, 0);

  }).on('autocompletesearch', function(e){
    // Cancel searching request if the user is still compositing words in
    // her/his IME.
    //
    if(isCompositing){ e.preventDefault(); }
  });

  // Setting up autocomplete style
  var meta = $('#autocomplete').data('uiAutocomplete')
  if(meta){
    meta._renderItem = function(ul, item){
      var re = new RegExp("(" + this.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ")", "gi"),
        word = item.value.replace(re,"<span class=\"text-info\">$1</span>");

      return $( "<li class=\"autocomplete-item\"></li>" )
        .append( "<a>" + word + "<i class=\"pull-right text-muted\">" + item.type + "</i></a>" )
        .appendTo( ul );
    };
    meta._renderMenu = function(ul, items){
      var that = this;
      $.each(items, function(i, item){
        that._renderItemData(ul, item);
      });

      $(ul).addClass('dropdown-menu') // Bootstrap dropdown menu class
    }
  }

  // Result page slider toggle
  $('.js-slider-toggle').click(function(){
    $(this).parents('.js-slider-container').toggleClass('is-toggled');
  });

}(jQuery));