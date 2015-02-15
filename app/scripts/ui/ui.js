

function sliderChange() {
  w.sliderDrag(this);
  w.saveCookie();
}
function sliderDrag() {
  w.sliderDrag(this);
}
function effectSelected() {
  var script = this._item_clicked || $(this).data('name');

  if(script != 'all_effects') w.changeScript(script);
}


var effectUI_data = [];

//called from createControls function in mappings.js
function updateEffectMappings() {

  if(!$$('params_effect')) return false;

  var elems = $$('params_effect').elements;
  for(var key in elems) $$('params_effect').removeView(elems[key].data.id);

  if(w.mappings[w.hash].length == 0) $$('params_effect').addView({view: 'text', value: 'No options available for this effect...' });

  for(var i=0; i < w.mappings[w.hash].length; i++) {
    var m = w.mappings[w.hash][i];
    $$('params_effect').addView({
      view: 'slider', 
      label: m.name.readable(),
      labelWidth: 150,
      name: m.name, 
      min: m.min, 
      max: m.max, 
      step: (m.max-m.min)/100,
      value: m.value, 
      on: {onChange: sliderChange, onSliderDrag: sliderDrag}
    });
  }
}

var palettesUI_data = [];
function updatePalettes() {
  if(typeof w.palettes != 'object' || !$$('palettes')) return;

  for(var i=0; i<w.palettes.length; i++) {
    var palette = w.palettes[i];
    palettesUI_data.push({
      id: palette.id,
      name: palette.title,
      hex1: palette.colors[0].hex,
      hex2: palette.colors[1].hex,
      hex3: palette.colors[2].hex,
      hex4: palette.colors[3].hex,
      hex5: palette.colors[4].hex
    });

  }
  $$('palettes').clearAll();
  $$('palettes').parse(palettesUI_data);
  $$('palettes').render();

}

function colorChanged() {
  console.log('color changed',this);
  w.paletteChange(this._selected[0]);
}