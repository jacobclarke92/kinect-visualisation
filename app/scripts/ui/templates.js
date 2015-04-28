function generateEffectsFiles() {
  
  var filesZone = $('#filesZone');
  filesZone.html('');
  console.log(effects);
  for(var i=0; i< effects.length; i++) {
    var template = $('#templates #fileTemplate').children().clone(true,true);
    $(template).attr('data-name',effects[i]);
    $(template).attr('id',effects[i]);
    $(template).html('&#xf1c9; '+effects[i].readable());
    filesZone.append(template);
  }
  filesZone.wrapInner('<ul class="fileGroup opened">');

}

function createSliders(sliderArray, target) {

  console.log('Generating sliders for ',target.selector);

  $.each(sliderArray, function(key, param) {

    // console.log(key, param);

    if($('#'+key).length == 0 && key.indexOf('_knob') == -1) {

      //clone parameter template
      var template = $('#templates #paramTemplate').children().clone();
      
      //init basic variables that are required to init noUiSlider
      if(typeof param.midi.min != 'number') param.midi.min = 0;
      if(typeof param.midi.max != 'number') param.midi.max = 1;
      var step = Math.round(Math.abs(param.midi.max-param.midi.min + 1)/100);
      if(typeof step != 'number') {
        step = 1;
        console.log('bad step',key, param.midi.max, param.midi.min, param);
      }
      var label = (isset(param.label )) ? param.label : (isset(param.name )) ? param.name.readable() : false;
      var cc = (isset(param.midi.cc ) && param.midi.cc != false) ? param.midi.cc : -1;

      if(label === false) {
        console.error('undefined param name!!!', param);
        return;
      }
      

      $('.title span',template).html(label);
      $('.slider .rangeText',template).attr({'id': param.name+'_text', 'data-name':param.name, value: param.midi.value, min: param.midi.min, max: param.midi.max, step: step});
      $('.slider .range',template).noUiSlider({
        start: [param.value],
        step: step,
        // connect: "lower",
        format: wNumb({
          decimals: 0
        }),
        animate: false,
        range: {
          'min': [param.midi.min],
          'max': [param.midi.max]
        }

      });
      $('.slider .range',template).val( param.midi.value );

      //if slider has a CC value stored in cookies, display it as such
      if(cc != -1) $('.slider .range .noUi-handle', template).attr('data-midi-linked','')
      $('.slider .range .noUi-handle', template).attr({'id': param.name, 'data-midi-mappable':'', 'data-midi-type':'pot', 'data-name':param.name, 'data-min':param.midi.min, 'data-max':param.midi.max, 'data-step':step, 'data-value':param.midi.value,'data-cc':cc, 'data-parent':$(target).attr('id')});
      
      var knobID = param.name+'_knob';
      
      if(isObjectPathSet(w.mappings, [w.hash, knobID, 'midi'])) {
        //if param knob has a CC value stored in cookies, display it as such
        console.log('knob mapping',w.mappings[w.hash][knobID]);
        if(isObjectPathSet(w.mappings, [w.hash, knobID, 'midi', 'cc']) && w.mappings[w.hash][knobID].midi.cc != -1) $('.mapKnob input',template).attr('data-midi-linked','');
        if(isObjectPathSet(w.mappings, [w.hash, knobID, 'midi', 'value'])) $('.mapKnob input',template).val(Math.round(w.mappings[w.hash][knobID].midi.value));
      }
      $('.mapKnob input',template).attr({'id':knobID, 'data-name': param.name+'_knob' });
      target.append(template);
    }
    
  });

  $('.mapKnob .dial',target).knob({
    'release': function (v) { 
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
      var handle = $('.noUi-handle',this);
      var key = handle.attr('data-name');
      var range = parseFloat(handle.attr('data-max'))-parseFloat(handle.attr('data-min'));
      console.log('range',range);

      if( range > 10 & val <= 2 ) {
        console.log('rounding to 0');
        $(this).val(0);
        val = 0;
      }

      if(val !== false) {
        $('#'+key+'_text').val(val);
        paramElementChanged(this, val);
        w.saveStorage();
      }
    }
  });

  //handle input number changes and scroll on hover
  $('.slider .rangeText', target).on({
    'change': function() {
      console.log('input text change');
      var slider = $('#'+$(this).attr('data-name')+'.noUi-handle').first();
      console.log(slider);
      var val = parseFloat( $(this).val() );
      console.log(typeof val);
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

// Gets called on effect change
function generateEffectParams() {
  var effectsZone = $("#effectsZone");
  effectsZone.html('');
  if(!isset(w.mappings[w.hash]) || Object.size(w.mappings[w.hash]) == 0) {
    $("#effectsZone").html('<p>No parameters for current effect ... add some! :D</p>');
    return;
  }
  var tempMappings = {};
  $.each(w.mappings[w.hash],function(key,param) {
    if(key.indexOf('calibration_') == -1 && key.indexOf('filter_') == -1 && param != null) tempMappings[key] = param;
  });
  console.log('effect mappings: ',tempMappings);
  createSliders(tempMappings, effectsZone);
  
}

// Only gets called once on init
function generateFilterParams() {
  var filterParams = {
    filter_rgbSplit: {
      label: 'RGB Split', name: 'filter_rgbSplit', 
      midi: {
        min: 0, 
        max: 100, 
        value: 0,
        cc: -1
      }
    },
    filter_displacement: {
      label: 'Displacement', name: 'filter_displacement',  midi: {
          min: 0, 
          max: 1000, 
          value: 0,
          cc: -1
      } 
    },
    filter_pixelate: {
      label: 'Pixelate', name: 'filter_pixelate', midi: {
          min: 0, 
          max: 100, 
          value: 0,
          cc: -1
      } 
    },
    filter_twist: {
      label: 'Twist', name: 'filter_twist', midi: {
          min: 0, 
          max: 15, 
          value: 0,
          cc: -1
      } 
    },
    filter_invert: {
      label: 'Invert', name: 'filter_invert', midi: {
        min: -2.5,
        max: 2.5,
        value: 0,
        cc: -1
      }
    },
    filter_blur: {
      label: 'Blur', name: 'filter_blur', midi: {
          min: 0, 
          max: 100, 
          value: 0,
          cc: -1
      } 
    }
  };

  console.info('CURRENT HASH: '+w.hash);

  $.each(filterParams,function(key,param) {
    if(isObjectPathSet(w.mappings, [w.hash, key])) {
      console.log('mapping for filter already exists!', key, w.mappings[w.hash][key]);
      filterParams[key] = w.mappings[w.hash][key];
      filterParams[key].label = (key.split('filter_').join('')).readable();
    }else{
      if(!isset(w.mappings[w.hash])) w.mappings[w.hash] = {};
      w.mappings[w.hash][key] = {
        label: param.label,
        name: param.name,
        midi: {
          value: 0,
          initValue: 0,
          postValue: 0,
          min: param.midi.min,
          max: param.midi.max,
          cc: -1
        },
        audio: false
      }
    }
  })
  var filterZone = $('#filtersZone');
  filterZone.html('');

  createSliders(filterParams,filterZone);
  
}

// Only gets called once on init
function generateCalibrationParams() {
  var offsetX = (w.winW) ? w.winW : 1000;
  var offsetY = (w.winH) ? w.winH : 1000;
  var calibrationParams = {
     //{label: 'Mirrored', name: 'calibration_mirrored', value: 0, on:{onChange:sliderChange}}
    calibration_depthThreshold: {
      label: 'Depth Threshold', 
      name: 'calibration_depthThreshold', 
      midi: {
        min: 100, 
        max: 254, 
        value: w.calibration_depthThreshold || 150, 
        cc: -1
      }
    },
    calibration_depthRange: {
      label: 'Depth Range', 
      name: 'calibration_depthRange', 
      midi: {
        min: 1, 
        max: 55, 
        value: w.calibration_depthRange || 30, 
        cc: -1
      }
    },
    calibration_offsetX: {
      label: 'Offset X', 
      name: 'calibration_offsetX', 
      midi: {
        min: -offsetX/2, 
        max: offsetX/2, 
        value: w.calibration_offsetX || 0, 
        cc: -1
      }
    },
    calibration_offsetY: {
      label: 'Offset Y', 
      name: 'calibration_offsetY', 
      midi: {
        min: -offsetY/2, 
        max: offsetY/2, 
        value: w.calibration_offsetY || 0, 
        cc: -1
      }
    },
    calibration_zoom: {
      label: 'Zoom', 
      name: 'calibration_zoom', 
      midi: {
        min: 0.2, 
        max: 4.0, 
        step: 0.1, 
        value: w.calibration_zoom || 0, 
        cc: -1
      }
    },
    calibration_perspective: {
      label: 'Perspective', 
      name: 'calibration_perspective', 
      midi: {min: 100, 
        max: 2000, 
        value: 800,
        cc: -1
      }
    },
    calibration_rotateX: {
      label: 'Rotate X', 
      name: 'calibration_rotateX', 
      midi: {
        min: -65, 
        max: 65, 
        value: w.calibration_rotateX || 0, 
        cc: -1
      }
    },
    calibration_rotateY: {
      label: 'Rotate Y', 
      name: 'calibration_rotateY', 
      midi: {
        min: -65, 
        max: 65, 
        value: w.calibration_rotateY || 0, 
        cc: -1
      }
    },
    calibration_mirror: {
      label: 'Mirrored', 
      name: 'calibration_mirrored', 
      midi: {
        min: 0, 
        max: 1, 
        value: w.calibration_mirrored || 0, 
        cc: -1
      }
    }
  };

  //overwrite calibration mapping if it exists in mappings already
  $.each(calibrationParams,function(key,param) {
    if(isObjectPathSet(w.mappings, [w.hash, key])) {
      console.log('mapping for calibration already exists!', key, w.mappings[w.hash][key]);
      calibrationParams[key] = false;
      calibrationParams[key] = w.mappings[w.hash][key];
      console.log(param.midi.value, calibrationParams[key].midi.value)
    }
  })
  console.log(calibrationParams);

  var calibrationZone = $('#calibrationZone');
  calibrationZone.html('');

  createSliders(calibrationParams,calibrationZone);

}

function generateDisplacementThumbs() {
   $('#displacementThumbZone').html('');
  if(isset(displacementMapImages)) {
    $.each(displacementMapImages,function(i, thumbURL) {
      var template = $('#templates #displacementImage').children().clone();
      $('#displacementThumbZone').append(template);
      var thumb =  $('#displacementThumbZone .displacement-thumb').last();
      thumb.css('background-image','url("/'+thumbURL+'")').attr('data-url','/'+thumbURL);
      if(i == 0) thumb.addClass('selected');
      thumb.unbind('click').bind('click',function() {
        $('.displacement-thumb').removeClass('selected');
        $(this).addClass('selected');
        w.updateDisplacementImage($(this).attr('data-url'));
      })
    });
  }else{
    console.warn('displacement map image list not inited');
  }
}


