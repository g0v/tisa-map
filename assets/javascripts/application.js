;(function($, window, document, undefined) {
	var $search_widget = $('input.main');
	$search_widget.autocomplete({
		source: function(token, response) {
			$.ajax({
				type: "POST",
				url: VARS.ajaxUrl,
				data: token,
				success: function(items){
					response(items);
				},
				dataType: 'json'
			});
		},
		delay: 0,
		autoFocus: true,
		sortResults:false,
		matchSubset: false,
		maxItems: 6,
		select: function(event, ui) {
			window.location.href = ui.item.url;
		}
	});

	var meta = $search_widget.data('uiAutocomplete');
	meta._renderItem = function( ul, item){
		var self = this;
		
		var re = new RegExp("(" + self.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ")", "gi"),
			word = item.name.replace(re,"<b>$1</b>");

		return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append( "<a>" + word + "</a>" )
			.appendTo( ul );
	};
})(jQuery, window, document);