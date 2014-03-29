//= require ../bootstrap
//= require ../jquery-ui-custom

(function($){
  "use strict";

  var
  DEBOUNCE_DELAY = 500, // milliseconds
  companyCache = {}, // Autocomplete cache
  lastXhr, // Autocomplete jqXHR object
  isCompositing = false, // Currently in IME composition mode.
  debounceHandler = null, // Debounce timer is running or not
  pendingTerm = ''; // The term queried in most recent query

  var resetPendingTerm = function(){
    pendingTerm = '';
  }

  var $autocomplete = $('#autocomplete');
  $autocomplete.autocomplete({
    source: function(query, resp){
      var term = query.term;

      if(lastXhr){
        lastXhr.abort();
      }
      if(companyCache[term]){
        resp(companyCache[term]);
      }

      pendingTerm = term;
      lastXhr = $.getJSON('/complete/'+term, {}).done(function(data){
        companyCache[term] = data;
        resp(data);
        resetPendingTerm();
      }).fail(function(){
        resp();
        resetPendingTerm();
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
    isCompositing = false;

    // Trigger search manually when IME composition ended.
    setTimeout(function(){
      $autocomplete.autocomplete('search');
    }, 0);

  }).on('autocompletesearch', function(e){
    // Prevent searching requests if the user is still compositing words in
    // her/his IME.
    //
    if(isCompositing){
      // console.log('is compositing!');
      e.preventDefault();
    }

    // If the debounced timer is ticking, prevent search requests
    //
    if(debounceHandler){
      // console.log("Debounced!");
      e.preventDefault();
    }

    // Setup debounce timer if the search is not prevented this time.
    //
    if(!e.isDefaultPrevented()){
      debounceHandler = setTimeout(function(){
        debounceHandler = null; // Cleanup handler

        // If the pending term is now different,
        // initate search immediately when debounce timer times up.
        //
        if(pendingTerm !== $autocomplete.val()){
          $autocomplete.autocomplete('search');
        }
      }, DEBOUNCE_DELAY);
    }
  });

  // Setting up autocomplete style
  var meta = $('#autocomplete').data('uiAutocomplete');
  if(meta){
    meta._renderItem = function(ul, item){
      var re = new RegExp("(" + this.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ")", "gi"),
        word = item.value.replace(re,"<span class=\"text-info\">$1</span>");

      return $( "<li class=\"autocomplete-item\"></li>" )
        .append( "<a><i class=\"pull-right text-muted\">" + item.type + "</i>" + word + "</a>" )
        .appendTo( ul );
    };
    meta._renderMenu = function(ul, items){
      var that = this;
      $.each(items, function(i, item){
        that._renderItemData(ul, item);
      });

      $(ul).addClass('dropdown-menu'); // Bootstrap dropdown menu class
    }
  }

  // Result page slider toggle
  $('.js-slider-toggle').click(function(){
    $(this).parents('.js-slider-container').toggleClass('is-toggled');
  });

}(jQuery));