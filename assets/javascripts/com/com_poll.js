//= require ../jquery.easypiechart

(function($){
  "use strict";

  var
    RESULT_DURATION = 1000, // ms of animation duration
    $section = $('#poll'),
    $formPanel = $('.poll-form'),
    $resultPanel = $('.poll-result'),
    $button = $formPanel.find('[type=submit]');

  // Handling the polling form submission
  $formPanel.find('form').submit(function(e){
    $button.button('loading');
    $.post('/poll', $(this).serialize(), function(data){
      // console.log('JSON Response', data);
      // Initialize easyPieChart
      $resultPanel.find('.result-data').easyPieChart({
        animate: RESULT_DURATION,
        barColor: '#FC9823',
        trackColor:'#E4E2E3',
        scaleColor: false,
        lineCap: 'butt',
        lineWidth: '7',
        size: '100'
      });

      var sum = data.results.reduce(function(s, i){return s+i}, 0);

      // Put percentage data into .result-data one-by-one
      $resultPanel.find('.result-data').each(function(idx, elem){

        var percentage = data.results[idx] * 100 / sum,
        $elem = $(elem);
      // Animate number of percentage in pie
        $({percent: 0}).animate({percent: percentage}, {
          duration: RESULT_DURATION,
          step: function(val){
            $elem.attr('data-percent', val.toFixed(1))
          }
        });
        $elem.data('easyPieChart').update(percentage);
      });

      // Actually resetting button is invisible.
      $button.button('reset');

      // Swapping the form and result using bootstrap class.
      $formPanel.addClass('animate-hidden');
      $resultPanel.removeClass('animate-hidden');
    }, 'json');
    e.preventDefault();
  })
}(jQuery));