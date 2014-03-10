(function($){
  "use strict";
  var
    $section = $('#poll'),
    $form = $('.poll-form'),
    $result = $('.poll-result'),
    $button = $form.find('[type=submit]');

  // Handling the polling form submission
  $form.submit(function(e){
    $button.button('loading');
    $.post('/com/poll', $form.serialize(), function(data){
      // TODO: dealing with results
      console.log('JSON Response', data);
      $result.find('.result-data').each(function(idx, elem){
        $(elem).text(data.results[idx] + '%');
      });

      $button.button('reset');

      // Swapping the form and result using bootstrap class.
      $form.removeClass('in');
      $result.addClass('in');
    }, 'json');
    e.preventDefault();
  })
}(jQuery));