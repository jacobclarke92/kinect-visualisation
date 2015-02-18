function generateEffectsFiles() {
  
  var filesZone = $('#filesZone');
  filesZone.html('');
  console.log(effects);
  for(var i=0; i< effects.length; i++) {
    var template = $('#templates #fileTemplate').children().clone(true,true);
    $(template).attr('data-name',effects[i]);
    $(template).html('&#xf1c9; '+effects[i].readable());
    filesZone.append(template);
  }
  filesZone.wrapInner('<ul class="fileGroup opened">');

}

function createSliders(sliderArray,target) {

  console.log('Generating sliders for ',target);

  for(var i=0; i<sliderArray.length; i++) {

    var param = sliderArray[i];
    var template = $('#templates #paramTemplate').children().clone();
    var step = Math.round(Math.abs(param.max-param.min + 1)/100);
    var label = (param.label) ? param.label : param.name.readable();
    var cc = (param.cc) ? param.cc : -1;
    $('.title span',template).html(label);
    $('.slider .rangeText',template).attr({'id': param.name+'_text', 'data-name':param.name, value: param.value, min: param.min, max: param.max, step: step});
    $('.slider .range',template).attr('id',param.name);
    $('.slider .range',template).noUiSlider({
      start: [param.value],
      step: step,
      // connect: "lower",
      format: wNumb({
        decimals: 0
      }),
      range: {
        'min': [param.min],
        'max': [param.max]
      }

    });
    $('.slider .range .noUi-handle', template).attr({'id': param.name, 'data-midi-mappable':'', 'data-midi-type':'pot', 'data-name':param.name, 'data-min':param.min, 'data-max':param.max, 'data-step':step, 'data-value':param.value,'data-cc':cc, 'data-parent':$(target).attr('id')});
    console.log(param);
    $('.mapKnob input',template).attr({'name':param.name+'_knob'});
    target.append(template);
    
  }
  $('.mapKnob .dial',target).knob({
    'change': function (v) { 
      console.log(v); 
    }
  });

  //slider events
  $('.slider .range',target).on({
    slide: function() {
      console.log('change',$(this).val());
      var val = $(this).val();
      if(val != false) {
        $('#'+this.id+'_text').val(val);
        w.sliderDrag(this, val);
      }
    },
    change: function() {
      var val = $(this).val();
      if(val != false) {
        $('#'+this.id+'_text').val(val);
        w.sliderDrag(this, val);
        w.saveCookie();
      }
    }
  });

  //handle input number changes and scroll on hover
  $('.slider .rangeText', target).on({
    'change': function() {
      var slider = $('#'+$(this).data('name'));
      var val = $(this).val();
      slider.val(val);
      w.sliderDrag(slider, val);
    },
    'mousewheel': function() {
      var slider = $('#'+$(this).data('name'));
      var val = $(this).val();
      slider.val(val);
      w.sliderDrag(slider, val);
    },
    'mouseenter': function() {
      $(this).data('over','true');
      $(this).focus();
    },
    'mouseleave': function() {$(this).data('over','false')},
    'keypress': function(e) {
      console.log(e,e.charCode);
      if($(this).data('over') == 'true' && e.charCode == 32) {
        var slider = $('#'+$(this).data('name'));
        $(this).val(0);
        slider.val(0);
        w.sliderDrag(slider, 0);
      }
    }
  });
  console.log($('.slider .range',target).val());

}

function generateEffectParams() {
  var effectsZone = $("#effectsZone");
  effectsZone.html('');
  if(typeof w.mappings[w.hash] == 'undefined' ||w.mappings[w.hash].length == 0) {
    $("#effectsZone").html('<p>No parameters for current effect ... add some! :D</p>');
    return;
  }

  createSliders(w.mappings[w.hash], effectsZone);
  
}

function generateFilterParams() {
  var filterParams = [
     {label: 'RGB Split', name: 'filter_rgbSplit', min: 0, max: 100, value: 0}
    ,{label: 'Displacement', name: 'filter_displacement', min: 0, max: 100, value: 0}
    ,{label: 'Pixelate', name: 'filter_pixelate', min: 0, max: 100, value: 0}
    ,{label: 'Twist', name: 'filter_twist', min: 0, max: 15, value: 0}
    // ,{label: 'Extreme Twist', name: 'filter_twist', min: 500, max: 510, value: 0}
    ,{label: 'Invert', name: 'filter_invert', min: -2.5, max: 2.5, value: 0}
    ,{label: 'Blur', name: 'filter_blur', min: 0, max: 100, value: 0}
  ];
  var filterZone = $('#filtersZone');
  filterZone.html('');

  createSliders(filterParams,filterZone);
  
}

function generateCalibrationParams() {
  var calibrationParams = [
     //{label: 'Mirrored', name: 'calibration_mirrored', value: 0, on:{onChange:sliderChange}}
     {label: 'Depth Threshold', name: 'calibration_depthThreshold', min: 100, max: 200, value: 0}
    ,{label: 'Depth Range', name: 'calibration_depthRange', min: 1, max: 50, value: 0}
    ,{label: 'Zoom', name: 'calibration_zoom', min: 0.2, max: 4.0, step: 0.1, value: 0}
    ,{label: 'Offset X', name: 'calibration_offsetX', min: -200, max: 200, value: 0}
    ,{label: 'Offset Y', name: 'calibration_offsetY', min: -200, max: 200, value: 0}
    ,{label: 'Rotate X', name: 'calibration_rotateX', min: -65, max: 65, value: 0}
    ,{label: 'Rotate Y', name: 'calibration_rotateY', min: -65, max: 65, value: 0}
    ,{label: 'Perspective', name: 'calibration_perspective', min: 10, max: 2000, value: 800}
  ];
  console.log(calibrationParams);

  var calibrationZone = $('#calibrationZone');
  calibrationZone.html('');

  createSliders(calibrationParams,calibrationZone);

}