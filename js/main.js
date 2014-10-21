$(document).ready(function() {
	var cities;
    var info;
    var currentYearIndex = 0;
    var interval;
    var full = false; 
	
    //set up a basic map window by selecting the "map" div element in index.html
	var map = L.map("map", {
		center: [50, 13],
		zoom: 4,
		maxZoom: 10,
		minZoom: 3
	});

	//identify which tile layer to use and then add it to the map
	L.tileLayer(
		'http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
			attribution: "Open Street Map Tiles" }).addTo(map);

	//use jquery to get the GeoJSON data and send it to be processed
	//loads the geojson then passes it to the .done method to be used in the 
	//anonymous function as "data".
	//if it failed, it'll excecute the alert
	$.getJSON("data/EuropePopulation.geojson").done(function(data) {
		//processed data gets stored as "info"
		info = processData(data);
		//calls the creation of preportional symbols using the processed data
		createPropSymbols(info.timestamps, data) 
        //creates the legend
        createLegend(info.minPre, info.maxPre, info.timestamps);
        //creates the VCR controls
        createPlayButtons(info.timestamps);
        // creates thet slider bar
        createSliderUI(info.timestamps);
        
        createCheckBox(info.timestamps);
        

        
	}).fail(function() {alert ("There has been a problem loading the data.")});                          
        
    //method that creates the VCR controls 
    function createPlayButtons(timestamps) {
        var playing = false;
        var buttonControl = L.control( {position: 'bottomleft'});
        
        buttonControl.onAdd = function(map) {
            var buttonContainer = L.DomUtil.create("div", "button-Container");
            
            L.DomEvent.addListener(buttonContainer, 'mousedown', function (e) {
                L.DomEvent.stopPropagation(e);
            });
            
            L.DomEvent.disableClickPropagation(buttonContainer);
            
            var rewind = L.DomUtil.create("span", "button", buttonContainer);
            $(rewind).append('<i class="fa fa-fast-backward fa-2x"></i>')
            var stepBack = L.DomUtil.create("span", "button", buttonContainer);
            $(stepBack).append('<i class="fa fa-step-backward fa-2x"></i>')
            var play = L.DomUtil.create("span", "button", buttonContainer);
            $(play).append('<i class="fa fa-play fa-2x"></i>')
            var pause = L.DomUtil.create("span", "button", buttonContainer);
            $(pause).append('<i class="fa fa-pause fa-2x"></i>')
            var stepForward = L.DomUtil.create("span", "button", buttonContainer);
            $(stepForward).append('<span class="fa fa-step-forward fa-2x"></span>')
            var last = L.DomUtil.create("span", "button", buttonContainer);
            $(last).append('<i class="fa fa-fast-forward fa-2x"></i>')
            
            $(rewind)
                .on('mouseover', function(e) {
                    $(rewind).css({'color': 'rgb(100, 50, 50)'});
                })
                .on('mouseout', function(e) {
                    $(rewind).css({'color': 'black'});
                })
            $(stepBack)
                .on('mouseover', function(e) {
                    $(stepBack).css({'color': 'rgb(100, 50, 50)'});
                })
                .on('mouseout', function(e) {
                    $(stepBack).css({'color': 'black'});
                })
            $(play)
                .on('mouseover', function(e) {
                    $(play).css({'color': 'rgb(100, 50, 50)'});
                })
                .on('mouseout', function(e) {
                    $(play).css({'color': 'black'});
                })            
            $(pause)
                .on('mouseover', function(e) {
                    $(pause).css({'color': 'rgb(100, 50, 50)'});
                })
                .on('mouseout', function(e) {
                    $(pause).css({'color': 'black'});
                })
            $(stepForward)
                .on('mouseover', function(e) {
                    $(stepForward).css({'color': 'rgb(100, 50, 50)'});
                })
                .on('mouseout', function(e) {
                    $(stepForward).css({'color': 'black'});
                })
            $(last)
                .on('mouseover', function(e) {
                    $(last).css({'color': 'rgb(100, 50, 50)'});
                })
                .on('mouseout', function(e) {
                    $(last).css({'color': 'black'});
                })
            
            $(rewind).on('click', function(){
               updatePropSymbols(timestamps[0]);
               $(".temporal-legend").text(timestamps[0]);
               $(".range-slider").val(0);
               currentYearIndex = 0;
            })
            
            $(stepBack).on('click', function() {
                if (currentYearIndex >=1) {
                    currentYearIndex --;
                }
                updatePropSymbols(timestamps[currentYearIndex]);
                $(".temporal-legend").text(timestamps[currentYearIndex]);
                $(".range-slider").val(currentYearIndex);
            })
            
            $(play).on('click', function () {
                console.log(playing);
                if (playing == false) {
                    playing = true;
                    animateTime(timestamps);    
                    $(play).css({'color': 'black'});
                }

            })
            
            $(pause).on('click', function () {
                clearInterval(interval);
                playing = false;
                
            })
            
            $(stepForward).on('click', function() {
                if (currentYearIndex < timestamps.length-1) {
                    currentYearIndex ++;
                }
                updatePropSymbols(timestamps[currentYearIndex]);
                $(".temporal-legend").text(timestamps[currentYearIndex]);
                $(".range-slider").val(currentYearIndex);
            })
                
            $(last).on('click', function(){
               updatePropSymbols(timestamps[timestamps.length-1]);
               $(".temporal-legend").text(timestamps[timestamps.length-1]);
               $(".range-slider").val(timestamps[timestamps.length-1]);
               currentYearIndex = timestamps.length-1;
            })

            return buttonContainer;
        }
        buttonControl.addTo(map)
    } //end Create buttons
    
    
    function animateTime(timestamps) {
        interval = setInterval(function() {
            if (currentYearIndex == timestamps.length-1) {
                currentYearIndex = 0;
            }
            else {
                currentYearIndex++;
            }                  
            updatePropSymbols(timestamps[currentYearIndex]);
            $(".temporal-legend").text(timestamps[currentYearIndex]);
            $(".range-slider").val(currentYearIndex);
        }, 800);
    }//end animate Time
    
    
	//creates the circles n stuff
	function createPropSymbols(timestamps, data) {
		//L.geoJson creates a "layer" so to speak from the data the 
		//edits it with the options
		cities = L.geoJson(data, {
			//this option creates personalized markers for each feature
			//using its lat and lng (latlng)
			pointToLayer: function(features, latlng) {
				return L.circleMarker(latlng, {
					fillColor: "rgb(251,106,74)",
					color: "rgb(251,106,74)",
					weight: 0,
					fillOpacity: 0.4,
					color: 'white'
				}).on({
					//on mouseover and mouse out, these things happen
					mouseover: function(e) {
						this.openPopup();
						this.setStyle({weight: 2});
					},
					mouseout: function(e) {
						this.closePopup();
						this.setStyle({weight: 0});
					}
				})
			}
		}).addTo(map);

		updatePropSymbols(timestamps[0]);
	}

	
	//passed a time event and upates the symbols accordingly
	function updatePropSymbols (timestamp) {
        
        updateLegend(timestamp);

		//calls up each city (which is each its own layer) and does the function
		cities.eachLayer(function(layer) {

            if (Number(timestamp) <= 1700) {
                layer.setStyle({fillColor:'rgb(251,106,74)'})
            }
            if (Number(timestamp) > 1700 && Number(timestamp) < 1900) {
                layer.setStyle({fillColor: 'rgb(222,45,38)'})
            }
            if(Number(timestamp) >= 1900) {
                layer.setStyle({fillColor: 'rgb(165,15,21)'})
            }

			//gets the city properties
			var props = layer.feature.properties;
			//calculates the radius by passing the value of that city's
			//selected timestamp attribute to the calcPropRadius function
			var radius = calcPropRadius (props[timestamp], timestamp);
			//assigns a formatted popup
			var popupContent = "<b>" + String(props[timestamp]) +
				" people</b><br>" + " in " +
				"<i>" + props.City +
				"</i> in </i>" + 
				timestamp + "</i>";
			//sets the radius of thing
			layer.setRadius(radius);
			//binds the new popup
			layer.bindPopup(popupContent, {offset: new L.Point(0, -radius) });
		});
	}

	//calculates a radius based off of the value
	function calcPropRadius(attributeValue, year) {
        var scaleFactor;

        if (full == false) {
            if (Number(year) <= 1700) {
                scaleFactor = 1/500;
            }
            if (Number(year) > 1700 && Number(year) < 1900) {
                scaleFactor = 1/1500;
            }
        
            if(Number(year) >= 1900) {
                scaleFactor = 1/8000;
            }
        }
        
        if (full) {
            scaleFactor = 1/5000;
        }
        
        area = attributeValue * scaleFactor;
            
        return Math.sqrt(area/Math.PI)*2;
	}
    
    
    function createLegend(min, max, timestamps) {
        var legend;
        function roundNumber(inNumber) {
            return (Math.round(inNumber/10) * 10);
        }
        
        legend = L.control( {position: 'topright' } );
        
        legend.onAdd = function(map) {
            var legendContainer = L.DomUtil.create("div", "legend");
            var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
            var classes = [roundNumber(max), roundNumber((max)/2), roundNumber(min)];
            var legendCircle;
            var lastRadius = 0;
            var currentRadius;
            var margin;
            
            L.DomEvent.addListener(legendContainer, 'mousedown', function(e) {
                L.DomEvent.stopPropagation(e);
            });
            
            $(legendContainer).append("<h2 id='legendTitle'>Population</h2>");
            $(legendContainer).append("<p id='era'>Pre-Industrial Era</p>");
            for (var i = 0; i < classes.length; i++) {
                legendCircle = L.DomUtil.create("div", "legendCircle");
                currentRadius = calcPropRadius(classes[i], timestamps[0]);
                margin = -currentRadius - lastRadius - 2;
                
                //they're squares that we turn into circles later!
                $(legendCircle).css({
                    "width": currentRadius*2 + "px",
                    "height": currentRadius*2 + "px",
                    "margin-left": margin+1.5 + "px"
                });
                
                $(legendCircle).append("<span class='legendValue'>" + classes[i] + "</span>");
                
                $(symbolsContainer).append(legendCircle);
                lastRadius = currentRadius;
                
            }
            
            $(legendContainer).append(symbolsContainer);
            
            return legendContainer;
            
        };
        
        legend.addTo(map);
                
    } // end CreateLegend()
    
    
    function updateLegend(year) {
        var max;
        var min;
        var newRadius;
        var lastRadius = 0;
        var margin;
        var newClasses;
        var legendCircle;
        var symbolsContainer = $(".symbolsContainer");
        

        
        if (full ==false) {
            if (Number(year) <= 1700) {
                min = info.minPre;
                max = info.maxPre;
                console.log("pre");
            }
            if (Number(year) > 1700 && Number(year) < 1900) {
                min = info.minMid;
                max = info.maxMid;
                console.log("mid");
            }
            if(Number(year) >= 1900) {
                min = info.minPost;
                max = info.maxPost;
                console.log("post");
            }
        }
        
        if (full) {
            min = info.minPre;
            max = info.maxPost;
        }

        newClasses = [roundNumber(max), roundNumber((max)/2), roundNumber(min)];

        
        for (var i = 0; i < newClasses.length; i++) {
            legendCircle = $(".legendCircle").eq(i);
            newRadius = calcPropRadius(newClasses[i], year);
            margin = -newRadius - lastRadius - 2;
                
            //radius are multiplied by 2 because they are div squres, not circles
            $(legendCircle).css({
                "width": newRadius*2 + "px",
                "height": newRadius*2 + "px",
                "margin-left": margin+1.5 + "px"   
            });

            if (Number(year) <= 1700) {
                $(legendCircle).css({
                    "background-color" : "rgba(251,106,74, 0.5)"
                });
                $("#era").text("Pre-Industrial Era");
            }
            if (Number(year) > 1700 && Number(year) < 1900) {
                $(legendCircle).css({
                    "background-color" : "rgba(222,45,38, 0.5)"
                });
                $("#era").text("Industrial Era");
            }
            if (Number(year) >= 1900) {
                $(legendCircle).css({
                    "background-color" : 'rgba(165,15,21, 0.5)'
                });
                $("#era").text("Modern Era");
            }
            $(".legendValue").eq(i).replaceWith("<span class='legendValue'>" + newClasses[i] + "</span>");

            
            lastRadius = newRadius;
                
        }
        
        function roundNumber(inNumber) {
            return (Math.round(inNumber/10) * 10);
        }
        
        if (full==false) {
            
            $('.legendValue').css({"right":"105px"});
            $('.symbolsContainer').css({'margin-left':'100px'});
        }
        
        if (full) {
            $('.legendValue').css({"right":"125px"});
            $('.symbolsContainer').css({'margin-left':'110px'});
        }
        
    } // end update legend
    
    
    function createSliderUI(timestamps) {       
        var sliderControl = L.control( {position: 'bottomleft'});
        
        sliderControl.onAdd = function(map) {
            var slider = L.DomUtil.create("input", "range-slider");
            
            L.DomEvent.addListener(slider, 'mousedown', function (e) {
                L.DomEvent.stopPropagation(e);
            });
            $(slider)
                    .attr({'type' : 'range',
                           'max' : timestamps.length-1,
                           'min' : 0,
                           'step' : 1,
                           'value' : 0
                     }).on('input', function() {
                            updatePropSymbols(timestamps[$(this).val()]);
                            $(".temporal-legend").text(timestamps[$(this).val()]);
                            currentYearIndex = $(this).val();
                    });
            return slider;
        }
        sliderControl.addTo(map)
        createTemporalLegend(timestamps[0]);
    } //end Create slider
    
    

	//Processing data
	function processData(data) {
		//arrary for time dependent features
		var timestamps = [];
		//crazy min max data values
		var minPre = Infinity;
		var maxPre = -Infinity;
        var minPost = Infinity;
        var maxPost = -Infinity;
        var minMid = Infinity;
        var maxMid = -Infinity;

		//loops through ever feature in the data set
		for (var feature in data.features) {

			//sets a list of properties based off those from a single feature
			var properties = data.features[feature].properties;
            
            //population number to be set for each attribute
            var numpop;
			//loops through each property
			for (var attribute in properties) {
                numpop = Number(properties[attribute]);

				//Wants only the time-dependent values pre 1900
				if (attribute != 'City' && attribute != 'Country' &&
					attribute != 'Latitude' && attribute != 'Longitude' &&
                   Number(attribute) <= 1700 ){


					//If the attribute name is not already in the timestamps array
					//a -1 is returned by jQuery. If we see a -1 returned then, we
					//can add that name to the timestamps array
					if ($.inArray(attribute, timestamps) === -1) {
						timestamps.push(attribute);
					}

					//sets min value for min pre 1900
					if (numpop < minPre && numpop != 0) {
                         minPre = properties[attribute];
                        
					}

					//sets max value for pre 1900
					if (numpop > maxPre) {
						maxPre = properties[attribute];
					}

				}
                
                if (attribute != 'City' && attribute != 'Country' &&
					attribute != 'Latitude' && attribute != 'Longitude' &&
                   Number(attribute) > 1700 && Number(attribute) < 1900 ){


					//If the attribute name is not already in the timestamps array
					//a -1 is returned by jQuery. If we see a -1 returned then, we
					//can add that name to the timestamps array
					if ($.inArray(attribute, timestamps) === -1) {
						timestamps.push(attribute);
					}

					//sets min value for min pre 1900
					if (numpop < minMid && numpop != 0) {
                         minMid = properties[attribute];
                        
					}

					//sets max value for pre 1900
					if (numpop > maxMid) {
						maxMid = properties[attribute];
					}

				}
                
                //Wants only the time-dependent values post 1900
				if (attribute != 'City' && attribute != 'Country' &&
					attribute != 'Latitude' && attribute != 'Longitude' &&
                   Number(attribute) >= 1900 ){


					//If the attribute name is not already in the timestamps array
					//a -1 is returned by jQuery. If we see a -1 returned then, we
					//can add that name to the timestamps array
					if ($.inArray(attribute, timestamps) === -1) {
						timestamps.push(attribute);
					}

					//sets min value for min pre 1900
					if (numpop < minPost && numpop != 0) {
                         minPost = properties[attribute];
                        
					}

					//sets max value for pre 1900
					if (numpop > maxPost) {
						maxPost = properties[attribute];
					}

				}

			}
		}
		//returns everything
		return {
			timestamps : timestamps,
			minPre : minPre,
			maxPre : maxPre,
            minPost : minPost,
            maxPost : maxPost,
            minMid : minMid,
            maxMid : maxMid

		}
	}
    
    function createTemporalLegend(startTimestamp) {
        
        var temporalLegend = L.control ({position: 'bottomleft' });
        
        temporalLegend.onAdd = function (map) {
            var output = L.DomUtil.create("output", "temporal-legend");
            $(output).text(startTimestamp);
            return output;
        }
        temporalLegend.addTo(map);
    }
    
    
    //hey carl, this works but I can't get the legend to look pretty when it's checked
    function createCheckBox(timestamps) {
        var checkControl = L.control({position: 'topright'});        

        checkControl.onAdd = function (map) {
            var checkContainer = L.DomUtil.create('div', 'checkContainer');

            var checkBox = L.DomUtil.create('input', 'checkbox', checkContainer);
            L.DomEvent.addListener(checkBox, 'mousedown', function (e) {
                L.DomEvent.stopPropagation(e);
            });
            
            L.DomEvent.disableClickPropagation(checkBox);

            $(checkBox)
                .attr({'type':'checkbox'})
                .on("click", function () {
                    if (this.checked) {
                        full = true;

                    }
                    if (this.checked == false) {
                        full = false;
                    }
                    updatePropSymbols(timestamps[currentYearIndex]);


                })
            $(checkContainer).append('  See Overall Sizes');

            return checkContainer;
            
        };

        checkControl.addTo(map);
    } //end of checkBox */

       
})