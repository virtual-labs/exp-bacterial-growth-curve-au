
/** Function for getting the points of graph */
function getPoints(evt) {  
	line_count ++;
	if ( line_count == max_line ) {
		enable_drag = true; /** changing the flag as true for enable the slider */
		dragSlider(getChild("arrow_slider1")); /** Function call to drag the slider1 */
		dragSlider(getChild("arrow_slider2")); /** Function call to drag the slider2 */
	}
	if ( line_count <= max_line ) {
		var circle = new createjs.Shape(); /** Drawing small circles as points */
		circle.graphics.beginFill("black").drawCircle(0, 0, 2);
		circle.x = evt.stageX;
		circle.y = evt.stageY;
		circle_arr.push(circle);
		graph_container.addChild(circle);
		var graph_line = new createjs.Shape(); /** Drawing the lines for connecting two points */
		graph_line.id = nth_obj;
		graph_line.graphics.setStrokeStyle(1);
		graph_line.graphics.beginStroke("black");
		if ( circle_arr.length > 1 ) { /** To draw line only when there is two point to connect */
			graph_line.graphics.moveTo(prev_x_val, prev_y_val);
			graph_line.graphics.lineTo(evt.stageX, evt.stageY);
			graph_line.graphics.endStroke();
			graph_container.addChild(graph_line);
		}
		line_obj_array[nth_obj] = graph_line; /** Pushing the graph lines into an array */
		nth_obj++; /** Increment of array index */
		prev_x_val= circle.x; /** Taking the previous point x and y value in variables */
		prev_y_val= circle.y;
	}
	bacterial_growth_stage.update();	
}

/** Function to drag Slider */
function dragSlider(slider_name) {
	slider_name.on("mousedown", mouseDown);
	slider_name.on("pressmove", mousePress);
	slider_name.on("pressup", mouseUp);	
	bacterial_growth_stage.update();	
}

/** Calculate the x, y position in the graph while mouse movement */
function calculateFn(cd1,cd2,cd3,cd4,x_position,y_position,div_factor) {
	var _base_point = 630; /** Starting point of graph from the bottom */
	var _selected_point = y_position; /** Current mouse over value  */
	var _difference = _base_point - _selected_point; /** Calculating the distance of current point from the bottom  */
	var _distance, _cuurent_y,  _exponent_value;  
	switch ( y_position <= 630 ) { /** Calculating the common difference value for finding the y position from the bottom */
		case (y_position >= 480 && y_position <= 630) : /** Setting the common difference value for finding the y position in the first grid */
			common_difference = cd1; 
			break;
		case ( y_position < 480 && y_position >= 355) :/** Calculating the difference value for finding the y position in the second grid */
			_distance = y_position - 355;
			_difference = _difference - _distance;					
			common_difference = cd2; /** Setting the common difference value */
			break;
		case ( y_position < 355 && y_position >= 220) :/** Calculating the difference value for finding the y position in the third grid */
			_distance = y_position - 220;
			_difference = _difference - (_distance*1.75);					
			common_difference = cd3;  /** Setting the common difference value */
			break;
		case ( y_position < 220 && y_position  >= 80 ) :/**Calculating the difference value for finding the y position in the top grid */
			_distance = y_position - 85;
			_difference = _difference - (_distance*2.5);
			common_difference = cd4;  /** Setting the common difference value */
			break;
	}
	_cuurent_y =  _difference * common_difference; /** Calculating the y position using difference */
	_exponent_value = parseInt(common_difference).toString().length + 1; /** Calculating the exponent value */
	_cuurent_y =_cuurent_y/Math.pow(10, _exponent_value); /** Extracting the first 3 digits from the current value */
	/** Assigning the x, y value to the tooltip */
	document.getElementById("graphToolTip").innerHTML = "X:"+((x_position- 80)/div_factor).toFixed(2)+", Y:"+_cuurent_y.toFixed(2)+" * 10<sup>"+ _exponent_value+"</sup>"
}

