//= require ../jquery.easypiechart
//= require ../interact

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
  });

  
  // 
  
  //vendor prefix 
  var transformProp = 'transform' in document.body.style?
                'transform': 'webkitTransform' in document.body.style?
                    'webkitTransform': 'mozTransform' in document.body.style?
                        'mozTransform': 'oTransform' in document.body.style?
                            'oTransform': 'msTransform';

  var barWidth = $('.poll-options label').width()*7;

  interact('.poll-options label')
    .dropzone(true)
    .accept('.drag-point')
    .on('dragenter', function(event){
      var dropzoneElement = event.target;
      dropzoneElement.click();
    })

  var wrapper = document.querySelector('.drag-point').parentNode;

  interact('.drag-point').draggable({
    onmove: function(event) {
      var target = event.target;
      target.x = (target.x|0) + event.dx;
      target.style[transformProp] = 'translate(' + target.x + 'px)';
    }
  }).restrict({
    drag: wrapper
  });

  $('.poll-options input').click(function(){
    var shift = $('.poll-options input:checked + label').position().left ;
    document.querySelector('.drag-point').style[transformProp] = 'translate(' + shift + 'px)';
  });

  
}(jQuery));