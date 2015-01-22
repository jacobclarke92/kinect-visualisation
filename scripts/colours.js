// http://www.colourlovers.com/api/colors/top

var palettes = [
	{
		id: '_0', 
		title: 'white', 
		lightest: 'FFFFFF', 
		darkest: '000000', 
		colors: [
			{hex: 'FFFFFF', rgb: [255,255,255]},
			{hex: 'FFFFFF', rgb: [255,255,255]},
			{hex: 'FFFFFF', rgb: [255,255,255]},
			{hex: 'FFFFFF', rgb: [255,255,255]},
			{hex: 'FFFFFF', rgb: [255,255,255]}
		],
		colorsMids: [
			{hex: 'FFFFFF', rgb: [255,255,255]},
		]
	}
];
var palettesHtml = '';
var currentPalette = false;
var paletteID = false; //only set by a loaded cookie

function getTopColours() {
	$('#colours').load('cl',function() {
		console.log('colours loaded');
	});

	$.ajax({
		type: "GET",
		url: "palettes.xml",
		datatype: "xml",
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Error: ' + errorThrown);
		},
		success: function(xml) {
			console.log('AJAX Request is succeded.',xml);
			palettesHtml = '<div class="palette" onclick="w.paletteChange(this)" id="_0"><span style="background-color: #FFFFFF; width: 100%;"></span></div>';
			
			$(xml).find('palettes palette').each(function(paletteIndex) {

				var palette = {};
				palette.id = $(this).find('id').html();
				palette.title = ($(this).find('title').html()).replace("<![CDATA[", "").replace("]]>", "");
				palette.colors = [];
				palette.colorsMids = [];

				var darkest = 765;
				var lightest = 0;

				palettesHtml += '<div class="palette" onclick="w.paletteChange(this)" id="'+palette.id+'">';
				$(this).find('colors hex').each(function(colorIndex) {
					var color = {};
					color.hex = $(this).html();
					color.rgb = [hexToR(color.hex), hexToG(color.hex), hexToB(color.hex)];
					var colorSum = color.rgb[0]+color.rgb[1]+color.rgb[2];
					if(colorSum > lightest) {
						lightest = colorSum;
						palette.lightest = color;
					}
					if(colorSum < darkest) {
						darkest = colorSum;
						palette.darkest = color;
					}
					palette.colors.push(color);
					palettesHtml += '<span style="background-color: #'+color.hex+'"></span>';
				});
				palettesHtml += '</div>';

				for(var i=0; i<palette.colors.length; i++) {
					if(palette.colors[i].hex != palette.lightest.hex && palette.colors[i].hex != palette.darkest.hex) palette.colorsMids.push(palette.colors[i]);
				}

				palettes.push(palette);
			});

			setTimeout(function() {
				$('#paletteZone',controlsPopup.document).html(palettesHtml);
				if(cookieLoaded && paletteID) {
					for(var i=0; i < palettes.length; i++) {
						
						if(paletteID == palettes[i].id) {

							currentPalette = palettes[i];
							$('#'+paletteID+'.palette',controlsPopup.document).addClass('active');
							console.info('Palette changed to:', currentPalette.title);
						}
					}
					
				}
			},200);

		}
	});
}
function paletteChange(div) {
	$('.palette',controlsPopup.document).removeClass('active');
	$(div).addClass('active');
	for(var i=0; i< palettes.length; i++) {
		if(palettes[i].id == $(div).attr('id')) currentPalette = palettes[i];
	}
	console.info('Palette changed to:', currentPalette.title);
	// console.log(div);
	saveCookie();
}
function randomPaletteColour() {
	if(currentPalette) {
		var colNum = Math.ceil(Math.random()*(currentPalette.colors.length-1));
		return rgbToHexInt(currentPalette.colors[colNum].rgb)
	}else{
		return Math.floor(Math.random()*16777215).toString(16); // generates random hex
	}
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}