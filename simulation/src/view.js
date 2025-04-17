(function() {
    angular.module('users')
        .directive("experiment", directiveFunction)
})();

/** Variables declarations */
var DIFFERENCE1, DIFFERENCE2, DIFFERENCE3, DIFFERENCE4;

var slider2_x_line_timer, slider2_line_initial_x, prev_slider2_line_initial_x;

var selected_index, max_line, common_difference, graph_tooltip_text, enable_drag;

var graph_container, nth_obj, prev_x_val, prev_y_val, mouse_over_graph, line_count;

var down_listner, press_listner, up_listner, graph_listner, down_listner_2, XMAX, INITIAL_LINE_X;

var slider1_x_line_timer, slider1_line_initial_x, prev_slider1_line_initial_x, STAGEYMIN, STAGEYMAX;

var container_border_rect = new createjs.Shape();

var collide_x_line_one = new createjs.Shape();

var collide_x_line_two =new createjs.Shape();

/** Arrays declarations */
var line_obj_array, circle_arr;

function directiveFunction() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            /** Variable that decides if something should be drawn on mouse move */
            var experiment = true;
            if ( element[0].width > element[0].height ) {
                element[0].width = element[0].height;
                element[0].height = element[0].height;
            } else {
                element[0].width = element[0].width;
                element[0].height = element[0].width;
            }
            if ( element[0].offsetWidth > element[0].offsetHeight ) {
                element[0].offsetWidth = element[0].offsetHeight;
            } else {
                element[0].offsetWidth = element[0].offsetWidth;
                element[0].offsetHeight = element[0].offsetWidth;
            }
			exp_canvas = document.getElementById("demoCanvas"); /** Initialization of canvas element */
			exp_canvas.width = element[0].width;
            exp_canvas.height = element[0].height;
			bacterial_growth_stage  = new createjs.Stage("demoCanvas") /** Initialization of stage element */
            queue = new createjs.LoadQueue(true); /** Initialization of queue object */
			loadingProgress(queue,bacterial_growth_stage,exp_canvas.width) /** Preloader function */
            queue.on("complete", handleComplete, this);
            queue.loadManifest([{ /** Loading all images into queue */
				id: "graph_staphylo_aureus", 
				src: "././images/graph_staphylo_aureus.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "graph_esche_coli",
                src: "././images/graph_esche_coli.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "slider1",
                src: "././images/slider1.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "slider2",
                src: "././images/slider2.svg",
                type: createjs.LoadQueue.IMAGE
			}
            ]);
            
			/** Activates mouse listeners on the stage */
            bacterial_growth_stage.enableDOMEvents(true);
            bacterial_growth_stage.enableMouseOver();
			createjs.Touch.enable(bacterial_growth_stage);
			/** Creating the graph container, that we have to mark the points inside the graph container that is inside the grid */
            graph_container = new createjs.Container(); 
            graph_container.name = "graph_container";            
            graph_container.alpha = 1;			
            function handleComplete() {
				/** loading images */
				loadImages(queue.getResult("graph_staphylo_aureus"), "graph_staphylo_aureus", 0, 0, "", 1); 	
				loadImages(queue.getResult("graph_esche_coli"), "graph_esche_coli", 0, 0, "", 1);
				loadImages(queue.getResult("slider1"), "top_slider", 570, 30, "",1);
				loadImages(queue.getResult("slider2"), "top_slider", 570, 50, "",1);
				loadImages(queue.getResult("slider1"), "arrow_slider1", 650, 600, "move",1); 	
				loadImages(queue.getResult("slider2"), "arrow_slider2", 680, 600, "move", 1); 
				setText("slider1_text", 600, 40, _("Slider1"), "black", 0.75, 0, bacterial_growth_stage); /** Label for Slider1 arrow */
                setText("slider2_text", 600, 60, _("Slider2"), "black", 0.75, 0, bacterial_growth_stage); /** Label for Slider2 arrow */
				setText("cell_numbers", 30, 400, _("Cell numbers"), "black", 1, -90, bacterial_growth_stage); /** Label for Cell numbers */
				setText("time", 300, 680, _("Time in minutes"), "black", 1, 0, bacterial_growth_stage); /** Label for Time in minutes */
				getChild("graph_staphylo_aureus").visible = false; 
				getChild("graph_esche_coli").visible = false;	
				container_border_rect.graphics.beginFill("white"); /** Creating graph container border */
                container_border_rect.graphics.drawRect(81, 83, 546, 547);
				container_border_rect.alpha = 0.1; /** Changing alpha value for hiding the container */
				graph_container.addChild(container_border_rect); /** Appending rectangle in the container */  
                bacterial_growth_stage.addChild(graph_container); /** Appending the container in the stage */   							
                translationLabels(); /** Translation of strings using gettext */
                initialisationOfVariables(scope); /** Function call to initialise all variables */
				graph_container.on("mouseover", function(event) { /** Set a flag as true on graph container mouse over for calculating x,y positions */
					mouse_over_graph = true;
                });
                graph_container.on("mouseout", function(event) { /** Set it as false on graph container mouse out for hiding tool tip */
                    mouse_over_graph = false;
                });
				displayGraphTooltip(); /** Function call to display tooltip for display the graph x and y values */
				scope.$apply();
				graph_tooltip_text = new createjs.DOMElement(document.getElementById("graphToolTip")); /** Creating dom element for tool tip display */
				graph_listner = graph_container.on("click", getPoints); /** Marking the points while clicking on graph container */
				bacterial_growth_stage.update(); /** updating stage */
			}

			/** Add all the strings used for the language translation here. '_' is the short cut for 
            calling the gettext function defined in the gettext-definition.js */
			function translationLabels() {
				/** This help array shows the hints for this experiment */
				helpArray = [_("help1"), _("help2"), _("help3"),_("Next"), _("Close")];
				/** Experiment name */
				scope.heading = _("Bacterial Growth Curve");
				/** Labels for buttons */
				scope.reset = _("reset");
				scope.variables = _("variables");
				scope.result = _("result");
				scope.copyright = _("copyright");
				/** Labels for select name of the bacteria*/
				scope.bacteria_label = _("Select the bacteria :");
				/** Labels for table column headings*/
				scope.time_label = _("Time in Mins ");
				scope.cell_label = _("Cell numbers ");
				/** Initializing bacteria name array */
				scope.bacteriaArray = [{optionsBacteria: _('option1'),type: 0}, {optionsBacteria: _('option2'),type: 1}];
            }
        }
    }	
}

/** All variables initialising in this function */
function initialisationOfVariables(scope) {
	selected_index = scope.bacteria_Mdl = 0; /** Initialising selected index variable */
	mouse_over_graph = false;  
	INITIAL_LINE_X = slider1_line_initial_x = slider2_line_initial_x  = 80; /** Initialising the starting point of graph*/   
	XMAX = 629; /** maximum X limit for dragging the sliders  */
	STAGEYMIN = 90; /** minimum Y limit of sliders */
	STAGEYMAX = 630; /** maximum Y limit of sliders */	
	/** Arrays initialisation */
	enable_drag = false;
	circle_arr = line_obj_array = [];
	/** Setting the common difference value based on the pixel values in each division of the graph */
	DIFFERENCE1 =  666.6667;  /** DIFFERENCE1 = 100000/150 where 100000 is the Y value at a distance of 150 pixel from base point 630 */
	DIFFERENCE2 =  3636.363636; /** DIFFERENCE2 = 1000000/275 where 1000000 is the Y value at a distance of 275 pixel from base point 630 */
	DIFFERENCE3 =  24390.2439; /** DIFFERENCE3 = 10000000/410 where 10000000 is the Y value at a distance of 410 pixel from base point 630 */
	DIFFERENCE4 =  183486.2385; /** DIFFERENCE4 = 100000000/545 where 100000000 is the Y value at a distance of 545 pixel from base point 630 */
}

/** Initialising the x,y position of slider images in this function */
function initialisationOfImages(scope) {
	getChild("arrow_slider1").x = 650; /** Initialising the x position of Slider 1 */
	getChild("arrow_slider2").x = 680;  /** Initialising the x position of Slider 2 */
	getChild("arrow_slider1").y = getChild("arrow_slider2").y = 600;  /** Initialising the y position of Slider 1 and Slider 2 */
}

/** Function to set the table values based on the drop down selection */
function setBacteriaFn(scope) {
	clearLines(); /** Function call to clear the lines drawn in the graph */
	circle_arr = []; /** Clearing the circle array while changing the drop down menu */
	initialisationOfImages(scope); /** Function call to reset the image positions */
	nth_obj = line_count = 0; /** Resetting the variables values */
	selected_index = scope.bacteria_Mdl; /** Assigning the selected bacteria name drop down index to a variable */
	if ( selected_index == 1 ) {
		max_line = 10; /** Setting the number of lines to be drawn if the selected item is Escherichia coli */
		getChild("graph_staphylo_aureus").visible = false; /** To hide the Staphylococcus aureus graph */
		getChild("graph_esche_coli").visible = true; /** To display the Escherichia coli graph */
		/** Setting the values for table */
		scope.data = { 
			values:[
			  {time:'0',cell:"4 * 10",power:3},
			  {time:'20',cell:"1 * 10",power:4},
			  {time:'40',cell:"2 * 10",power:4},
			  {time:'60',cell:"4 * 10",power:4},
			  {time:'80',cell:"8 * 10",power:4},
			  {time:'100',cell:"1.6 * 10",power:5},
			  {time:'120',cell:"3.2 * 10",power:5},
			  {time:'140',cell:"6.4 * 10",power:5},
			  {time:'160',cell:"1.28 * 10",power:6},
			  {time:'180',cell:"2.56 * 10",power:6},
			]
		};
	} else {
		max_line = 9; /** Setting the number of lines to be drawn if the selected item is Staphylococcus aureus */
		getChild("graph_esche_coli").visible = false; /** To hide the Escherichia coli graph */
		getChild("graph_staphylo_aureus").visible = true; /** To display the Staphylococcus aureus graph */
		/** Setting the values for table */
		scope.data = {
			values:[
			  {time:'0',cell:"5 * 10",power:4},
			  {time:'30',cell:"1 * 10",power:5},
			  {time:'60',cell:"2 * 10",power:5},
			  {time:'90',cell:"4 * 10",power:5},
			  {time:'120',cell:"8 * 10",power:5},
			  {time:'150',cell:"1.6 * 10",power:6},
			  {time:'180',cell:"3.2 * 10",power:6},
			  {time:'210',cell:"6.4 * 10",power:6},
			  {time:'240',cell:"1.28 * 10",power:7}
			]
		};
	}
	bacterial_growth_stage.update(); /** updating stage */	
}

/** Function to clear all lines drawn in the graph */
function clearLines() {
	/** Clearing the array used for drawing circles and lines */
	for ( var i=0;i<=circle_arr.length;i++ ) {
		graph_container.removeChild(circle_arr[i]);
		graph_container.removeChild(line_obj_array[i]);
	}
	clearInterval(slider1_x_line_timer);  /** Clearing the interval used for drawing the Staphylococcus aureus graph */
	clearInterval(slider2_x_line_timer);  /** Clearing the interval used for drawing the Escherichia coli graph */
	if ( collide_x_line_one ) { /** Clearing the existing line from the stage */
		collide_x_line_one.graphics.clear(); 	
	}
	if ( collide_x_line_two ) {  /** Clearing the existing line from the stage */
		collide_x_line_two.graphics.clear();	
	}
}
/** All the texts loading and added to the stage */
function setText(name, textX, textY, value, color, fontSize,rot,container) { 
    var _text = new createjs.Text(value, "bold " + fontSize + "em Tahoma, Geneva, sans-serif", color);
    _text.x = textX;
    _text.y = textY;
    _text.textBaseline = "alphabetic";
    _text.name = name;
    _text.text = value;
    _text.color = color;
	_text.rotation = rot;
	bacterial_growth_stage.addChild(_text); /** Adding text to the container */
}

/** All the images loading and added to the stage */
function loadImages(image, name, xPos, y_position, cursor, scale) {
	var _bitmap = new createjs.Bitmap(image).set({});
    _bitmap.x = xPos;
    _bitmap.y = y_position;
	_bitmap.scaleX = _bitmap.scaleY = scale;
    _bitmap.name = name;
	_bitmap.cursor = cursor;
    bacterial_growth_stage.addChild(_bitmap); /** Adding bitmap to the stage */
}

/** Reset the experiment in the reset button event */
function resetExperiment(scope) {
	clearLines(); /** Function call to clear the lines drawn in the graph */
	initialisationOfVariables(scope); /** Resetting all variable values */
	setBacteriaFn(scope); /** Resetting drop down menu to initial value */
	bacterial_growth_stage.update(); /** Updating the stage */	
}

/** Function to return child element of stage */
function getChild(child_name) {
    return bacterial_growth_stage.getChildByName(child_name);
}

/** Function for making tooltip for display the graph x and y values */
function displayGraphTooltip() { 
	var _div_factor; /** Variable to store the dividing value for finding x position */
    bacterial_growth_stage.on("stagemousemove", function(event) { 
        if ( mouse_over_graph ) { /** If the mouse is over the grid */
			graph_tooltip_text.alpha = 1;
			bacterial_growth_stage.addChild(graph_tooltip_text); /** Adding tooltip component to the stage*/
            /** Finding the x and y values of graph and display it on the text area */
			switch ( selected_index ) {
				/** To display the tool tip x,y values if the selected item is Staphylococcus aureus */
				case "0": _div_factor = 2;
						  /** Differences = Highest Y value in each division / Distance between the selected point and the base point */
						  calculateFn(DIFFERENCE1,DIFFERENCE2,DIFFERENCE3,DIFFERENCE4,event.stageX,event.stageY,_div_factor)
						  break;	
				/** To display the tool tip x,y values if the selected item is Escherichia coli */
				case "1": _div_factor = 3;
						  /** Differences = Highest Y value in each division / Distance between the selected point and the base point */
						  calculateFn(DIFFERENCE1/10,DIFFERENCE2/10,DIFFERENCE3/10,DIFFERENCE4/10,event.stageX,event.stageY,_div_factor)
					      break;
			} 
			graph_tooltip_text.x = event.stageX + 3 ;
			graph_tooltip_text.y = event.stageY - 25;
	   } else { /** Else its out of the grid */
			graph_tooltip_text.alpha = 0; /** To hide the tooltip box */
        }
		bacterial_growth_stage.update(); /** Updating the stage */		
    });
}

/** Mouse down event function */
function mouseDown(evt) {
	if ( evt.target.name == "arrow_slider1" ) { /** Checking the name of slider while click */
		clearInterval(slider1_x_line_timer); /** For clearing the running timer while clicking the slider */
		collide_x_line_one.graphics.clear(); /** For clearing the existing lines from the graph */
	}
	else {
		clearInterval(slider2_x_line_timer); /** For clearing the running timer while clicking the slider */
		collide_x_line_two.graphics.clear(); /** For clearing the existing lines from the graph */
	}
    this.parent.addChild(this);
    this.offset = {
        y: this.y - evt.stageY
    };
	bacterial_growth_stage.update(); /** Updating the stage */
}

/** Mouse press event function */
function mousePress(evt) {
    if ( evt.stageY > STAGEYMIN && evt.stageY < STAGEYMAX && enable_drag) { /** To limit the top, bottom movement of slider */
        this.y = evt.stageY + this.offset.y; /** To drag the slider om mouse press */
    }
	bacterial_growth_stage.update(); /** Updating the stage */
}

/** Mouse up event function */
function mouseUp(evt) {
	if(enable_drag){
		if ( evt.target.name == "arrow_slider1" ) { /** Checking the name of slider while click */
			clearInterval(slider1_x_line_timer); /** For clearing the running timer while clicking on the slider1 */
			slider1_line_initial_x = prev_slider1_line_initial_x = INITIAL_LINE_X;    
			slider1_x_line_timer = setInterval(function() {
				drawCollideXlineOne(); /** Function call to show the intersecting point of Slider1 */
			}, 10); /** Draw x line timer of slider1 */
		} else {
			clearInterval(slider2_x_line_timer); /** For clearing the running timer while clicking on the slider2 */
			slider2_line_initial_x = prev_slider2_line_initial_x = INITIAL_LINE_X;
			slider2_x_line_timer = setInterval(function() {
				drawCollideXlineTwo(); /** Function call to show the intersecting point of Slider2 */
			}, 10); /** Draw x line timer of slider2 */ 
		}
	}	
}

/** Function for drawing collide point x line of slider1 on draging slider1 arrow */
function drawCollideXlineOne() { 
    if ( slider1_line_initial_x < XMAX ) { /** To check whether the line reaches the x maximum limit */
        slider1_line_initial_x++;	
		/** For drawing the horizontal line till the intersecting point*/
        collide_x_line_one.graphics.moveTo(prev_slider1_line_initial_x, getChild("arrow_slider1").y).setStrokeStyle(1).beginStroke("RED").lineTo(slider1_line_initial_x, getChild("arrow_slider1").y); 
        collide_x_line_one.graphics.endStroke();
        prev_slider1_line_initial_x = slider1_line_initial_x;
        graph_container.addChild(collide_x_line_one); /** Adding the line to the container */
        for ( i = 1; i < line_obj_array.length; i++ ) {
            /** Check whether the collide point x line hit with the graph line */
            if ( line_obj_array[i].hitTest(slider1_line_initial_x, getChild("arrow_slider1").y) ) { 
				/** For drawing the vertical line from the intersecting point */
                collide_x_line_one.graphics.moveTo(prev_slider1_line_initial_x, getChild("arrow_slider1").y).setStrokeStyle(1).beginStroke("RED").lineTo(slider1_line_initial_x, STAGEYMAX);
                clearInterval(slider1_x_line_timer); /** Clearing the interval after line drawn */
				/** Checking the mouse events while drawing lines */
                down_listner = getChild("arrow_slider1").on("mousedown", mouseDown);
                press_listner = getChild("arrow_slider1").on("pressmove", mousePress);
                up_listner = getChild("arrow_slider1").on("pressup", mouseUp);
            }
		}
	} else {
		clearInterval(slider1_x_line_timer); /** Clearing the interval after drawing lines */
		/** Listening the mouse events of the slider */
		down_listner = getChild("arrow_slider1").on("mousedown", mouseDown);
		press_listner = getChild("arrow_slider1").on("pressmove", mousePress);
		up_listner = getChild("arrow_slider1").on("pressup", mouseUp);
    }
	bacterial_growth_stage.update(); /** Updating the stage */
}

/** Function for drawing collide point x line of slider2 on draging slider2 arrow */
function drawCollideXlineTwo() {
    if ( slider2_line_initial_x < XMAX ) {
        slider2_line_initial_x++;
		/** For drawing the horizontal line till the intersecting point*/
        collide_x_line_two.graphics.moveTo(prev_slider2_line_initial_x, getChild("arrow_slider2").y).setStrokeStyle(1).beginStroke("GREEN").lineTo(slider2_line_initial_x, getChild("arrow_slider2").y); 
        collide_x_line_two.graphics.endStroke();
        prev_slider2_line_initial_x = slider2_line_initial_x;
        graph_container.addChild(collide_x_line_two); /** Adding the line to the container */
        for(i = 1; i < line_obj_array.length; i++) {
            /** Check whether the collide point x line hit with the graph line */
            if ( line_obj_array[i].hitTest(slider2_line_initial_x, getChild("arrow_slider2").y)) {
				/** For drawing the vertical line from the intersecting point */
                collide_x_line_two.graphics.moveTo(prev_slider2_line_initial_x, getChild("arrow_slider2").y).setStrokeStyle(1).beginStroke("GREEN").lineTo(slider2_line_initial_x, STAGEYMAX);
                clearInterval(slider2_x_line_timer); /** Clearing the interval after line drawn */
				/** Checking the mouse events while drawing lines */
                down_listner_2 = getChild("arrow_slider2").on("mousedown", mouseDown);
                press_listner_2 = getChild("arrow_slider2").on("pressmove", mousePress);
                up_listner_2 = getChild("arrow_slider2").on("pressup", mouseUp);
            }
        }
    } else {
        clearInterval(slider2_x_line_timer); /** Clearing the interval after drawing lines */
		/** Listening the mouse events of the slider */
        down_listner_2 = getChild("arrow_slider2").on("mousedown", mouseDown);
        press_listner_2 = getChild("arrow_slider2").on("pressmove", mousePress);
        up_listner_2 = getChild("arrow_slider2").on("pressup", mouseUp);
    } 
	bacterial_growth_stage.update(); /** Updating the stage */
}





