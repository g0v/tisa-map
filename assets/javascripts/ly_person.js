;(function() {
  var ly_arr = [];

  function get_person(callback) {
    $.getJSON('/json_data/tisa-person.json', function (ly_data) {
      var ly_data = ly_data;
      $.getJSON('/json_data/mly-8.json', function (data) {

        for (var i = ly_data.length - 1; i >= 0; i--) {
          for (var j = data.length - 1; j >= 0; j--) {
            if(data[j].name === ly_data[i]) {
              ly_arr.push(data[j])
            }
          };

        };
      
        callback(ly_arr);
      
      });
    });
  }


  function ly_temp() {
    $.ajax({
        url: '/assets/hbs/ly.hbs',
        cache: true,
        success: function(data) {
            var source    = data;
            var template  = Handlebars.compile(source);
            var ly_html;
            console.log(data);
            get_person(function(ly) {
              console.log(ly);
              ly_html = template(ly)
              console.log(ly_html);
              $('#ly_area').html(ly_html);
            })
        }               
    });
  }

  ly_temp();

}).call(this)