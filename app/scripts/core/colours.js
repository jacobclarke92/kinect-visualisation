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
		url: "/app/palettes.xml",
		datatype: "xml",
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Error: ' + errorThrown);
		},
		success: function(xml) {
			console.info('Colour palettes loaded.',xml);
			palettesHtml = '<div class="palette" onclick="w.paletteChange(this)" id="_0"><span style="background-color: #FFFFFF; width: 100%;"></span></div>';
			
			$(xml).find('palettes palette').each(function(paletteIndex) {

				var palette = {};
				palette.id = $(this).find('id').html();
				palette.title = ($(this).find('title').html()).replace("<![CDATA[", "").replace("]]>", "");
				palette.colors = [];
				palette.colorsMids = [];

				var darkest = 765;
				var lightest = 0;

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
				});

				for(var i=0; i<palette.colors.length; i++) {
					if(palette.colors[i].hex != palette.lightest.hex && palette.colors[i].hex != palette.darkest.hex) palette.colorsMids.push(palette.colors[i]);
				}

				palettes.push(palette);
			});

			setTimeout(function() {

				uiPopup.updatePalettes();

				if(storageLoaded && paletteID) {
					for(var i=0; i < palettes.length; i++) {
						
						if(paletteID == palettes[i].id) {

							currentPalette = palettes[i];
							$('#'+paletteID+'.palette',uiPopup.document).addClass('active');
							console.info('Palette changed to:', currentPalette.title);
						}
					}
				}

			},6000);

		}
	});
}
function paletteChange(colorID) {

	console.log(colorID);
	if(colorID.indexOf('palette_') > -1) colorID = colorID.split('palette_').join('');
	
	for(var i=0; i< palettes.length; i++) {
		if(palettes[i].id == colorID) currentPalette = palettes[i];
	}
	console.info('Palette changed to:', currentPalette.title);
	// console.log(div);
	saveStorage();
}

function randomPaletteColour() {
	if(currentPalette) {
		var colNum = Math.floor(Math.random()*(currentPalette.colors.length));
		return rgbToHexInt(currentPalette.colors[colNum].rgb)
	}else{
		return Math.floor(Math.random()*16777215).toString(16); // generates random hex
	}
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}