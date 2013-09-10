//= require_tree .
$(document).ready(function() {
    $("#scroll-down").click(function(e) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: $(window).height() }, 1000);
    });
});
