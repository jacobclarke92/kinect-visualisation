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

  console.log('Generating sliders for ',target.selector);

  $.each(sliderArray, function(key, param) {

    // console.log(key, param);

    if($('#'+key).length == 0 && key.indexOf('_knob') == -1) {

      //clone parameter template
      var template = $('#templates #paramTemplate').children().clone();
      
      //init basic variables that are required to init noUiSlider
      var step = Math.round(Math.abs(param.max-param.min + 1)/100);
      var label = (isset(param.label )) ? param.label : (isset(param.name )) ? param.name.readable() : 'Undefined param name';
      var cc = (isset(param.cc )) ? param.cc : -1;
      

      $('.title span',template).html(label);
      $('.slider .rangeText',template).attr({'id': param.name+'_text', 'data-name':param.name, value: param.value, min: param.min, max: param.max, step: step});
      $('.slider .range',template).noUiSlider({
        start: [param.value],
        step: step,
        // connect: "lower",
        format: wNumb({
          decimals: 0
        }),
        animate: false,
        range: {
          'min': [param.min],
          'max': [param.max]
        }

      });

      //if slider has a CC value stored in cookies, display it as such
      if(cc != -1) $('.slider .range .noUi-handle', template).attr('data-midi-linked','')
      $('.slider .range .noUi-handle', template).attr({'id': param.name, 'data-midi-mappable':'', 'data-midi-type':'pot', 'data-name':param.name, 'data-min':param.min, 'data-max':param.max, 'data-step':step, 'data-value':param.value,'data-cc':cc, 'data-parent':$(target).attr('id')});
      
      var knobID = param.name+'_knob';
      
      if(isset(w.mappings[w.hash]) && isset(w.mappings[w.hash][knobID] )) {
        //if param knob has a CC value stored in cookies, display it as such
        console.log('knob mapping',w.mappings[w.hash][knobID]);
        if(isset(w.mappings[w.hash][knobID]['cc'] ) && w.mappings[w.hash][knobID].cc != -1) $('.mapKnob input',template).attr('data-midi-linked','');
        if(isset(w.mappings[w.hash][knobID]['value'] )) $('.mapKnob input',template).val(Math.round(w.mappings[w.hash][knobID].value));
      }
      $('.mapKnob input',template).attr({'id':knobID, 'data-name': param.name+'_knob' });
      target.append(template);
    }
    
  });

  $('.mapKnob .dial',target).knob({
    'change': function (v) { 
      paramElementChanged(this,v);
    }
  });

  //slider events
  $('.slider .range',target).on({
    slide: function() {
      var val = $(this).val();
      var key = $('.noUi-handle',this).attr('data-name');
      console.log('change',$(this).val());
      // console.log(this);
      if(val != false) {
        $('#'+key+'_text').val(val);
        paramElementChanged(this, val);
      }
    },
    change: function() {
      var val = $(this).val();
      var key = $('.noUi-handle',this).attr('data-name');
      if(val != false) {
        $('#'+key+'_text').val(val);
        paramElementChanged(this, val);
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
      paramElementChanged(slider, val);
    },
    'mousewheel': function() {
      var slider = $('#'+$(this).data('name'));
      var val = $(this).val();
      slider.val(val);
      paramElementChanged(slider, val);
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

}

function generateEffectParams() {
  var effectsZone = $("#effectsZone");
  effectsZone.html('');
  if(!isset(w.mappings[w.hash]) || Object.size(w.mappings[w.hash]) == 0) {
    $("#effectsZone").html('<p>No parameters for current effect ... add some! :D</p>');
    return;
  }
  var tempMappings = {};
  $.each(w.mappings[w.hash],function(key,param) {
    if(param.name.indexOf('calibration_') == -1 && param.name.indexOf('filter_') == -1) tempMappings[key] = param;
  });
  console.log('effect mappings: ',tempMappings);
  createSliders(tempMappings, effectsZone);
  
}

function generateFilterParams() {
  var filterParams = {
    filter_rgbSplit: {label: 'RGB Split', name: 'filter_rgbSplit', min: 0, max: 100, value: 0},
    filter_displacement: {label: 'Displacement', name: 'filter_displacement', min: 0, max: 100, value: 0},
    filter_pixelate: {label: 'Pixelate', name: 'filter_pixelate', min: 0, max: 100, value: 0},
    filter_twist: {label: 'Twist', name: 'filter_twist', min: 0, max: 15, value: 0},
    //  ': {label: 'Extreme Twist', name: 'filter_twist', min: 500, max: 510, value: 0}
    filter_invert: {label: 'Invert', name: 'filter_invert', min: -2.5, max: 2.5, value: 0},
    filter_blur: {label: 'Blur', name: 'filter_blur', min: 0, max: 100, value: 0}
  };
  $.each(filterParams,function(key,param) {
    if(isset(w.mappings[w.hash]) && isset(w.mappings[w.hash][key])) {
      filterParams[key] = w.mappings[w.hash][key];
      //this just makes it so the titles don't contain 'Filter' when t
      filterParams[key].label = (key.split('filter_').join('')).readable();
    }
  })
  var filterZone = $('#filtersZone');
  filterZone.html('');

  createSliders(filterParams,filterZone);
  
}

function generateCalibrationParams() {
  var calibrationParams = {
     //{label: 'Mirrored', name: 'calibration_mirrored', value: 0, on:{onChange:sliderChange}}
    calibration_depthThreshold: {label: 'Depth Threshold', name: 'calibration_depthThreshold', min: 100, max: 200, value: 0},
    calibration_depthRange: {label: 'Depth Range', name: 'calibration_depthRange', min: 1, max: 50, value: 0},
    calibration_zoom: {label: 'Zoom', name: 'calibration_zoom', min: 0.2, max: 4.0, step: 0.1, value: 0},
    calibration_offsetX: {label: 'Offset X', name: 'calibration_offsetX', min: -200, max: 200, value: 0},
    calibration_offsetY: {label: 'Offset Y', name: 'calibration_offsetY', min: -200, max: 200, value: 0},
    calibration_rotateX: {label: 'Rotate X', name: 'calibration_rotateX', min: -65, max: 65, value: 0},
    calibration_rotateY: {label: 'Rotate Y', name: 'calibration_rotateY', min: -65, max: 65, value: 0},
    calibration_perspective: {label: 'Perspective', name: 'calibration_perspective', min: 10, max: 2000, value: 800}
  };
  $.each(calibrationParams,function(key,param) {
    if(isset(w.mappings[w.hash]) && isset(w.mappings[w.hash][key])) calibrationParams[key] = w.mappings[w.hash][key];
  })
  console.log(calibrationParams);

  var calibrationZone = $('#calibrationZone');
  calibrationZone.html('');

  createSliders(calibrationParams,calibrationZone);

}