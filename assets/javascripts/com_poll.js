//= require jquery.easypiechart

(function($){
  "use strict";

  var
    RESULT_DURATION = 1000, // ms of animation duration
    $section = $('#poll'),
    $form = $('.poll-form'),
    $result = $('.poll-result'),
    $button = $form.find('[type=submit]');

  // Handling the polling form submission
  $form.submit(function(e){
    $button.button('loading');
    $.post('/poll', $form.serialize(), function(data){
      // console.log('JSON Response', data);
      // Initialize easyPieChart
      $result.find('.result-data').easyPieChart({
        animate: RESULT_DURATION
      });

      // Put percentage data into .result-data one-by-one
      $result.find('.result-data').each(function(idx, elem){
        var percentage = data.results[idx],
        $elem = $(elem);

        $({percent: 0}).animate({percent: percentage}, {
          duration: RESULT_DURATION,
          step: function(val){
            $elem.attr('data-percent', val.toFixed(1)+'%')
          }
        });
        $elem.data('easyPieChart').update(percentage);
      });

      // Actually resetting button is invisible.
      $button.button('reset');

      // Swapping the form and result using bootstrap class.
      $form.addClass('hide');
      $result.removeClass('hide');
    }, 'json');
    e.preventDefault();
  })
}(jQuery));