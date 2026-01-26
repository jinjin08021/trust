/**************************************
 * Population Page Component
 * Manages population controls for all strategies
 **************************************/
function PopulationPage(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM
	self.dom = document.createElement("div");
	self.dom.className = "sandbox_page";
	
	// Labels
	self.dom.appendChild(_makeLabel("sandbox_population", {x:0, y:0, w:433}));
	
	// Create an icon, label, and slider... that all interact with each other.
	var sliders = [];
	var _makePopulationControl = function(x, y, peepID, defaultValue){
		
		// DOM
		var popDOM = document.createElement("div");
		popDOM.className = "sandbox_pop";
		popDOM.style.left = x;
		popDOM.style.top = y;
		self.dom.appendChild(popDOM);
		
		// Message
		var message = "sandbox/pop/"+peepID;
		
		// Strategy descriptions (simple terms)
		var strategyDescriptions = {
			"tft": "Starts with Cooperate, then mirrors you. You cooperate → I cooperate. You cheat → I cheat. Simple mirroring.",
			"all_d": "Always cheats",
			"all_c": "Always cooperates",
			"grudge": "Starts with Cooperate, keeps cooperating until you cheat once. Afterwards, always plays Cheat",
			"prober": "Starts with Cooperate, Cheat, Cooperate, Cooperate. If you retaliate, acts like Copycat. Otherwise, acts like Always Cheat",
			"tf2t": "Starts with Cooperate. Only retaliates if you cheated TWICE in a row",
			"pavlov": "Starts with Cooperate. If you cooperated, I repeat my last move. If you cheated, I switch my move. Win-stay-lose-shift.",
			"random": "Randomly cheats or cooperates with 50-50 chance"
		};
		
		// Icon with tooltip
		var popIcon = document.createElement("div");
		popIcon.className = "sandbox_pop_icon";
		popIcon.style.backgroundPosition = (-PEEP_METADATA[peepID].frame*40)+"px 0px";
		popIcon.style.cursor = "help";
		popIcon.style.position = "relative";
		popDOM.appendChild(popIcon);
		
		// Add tooltip
		var tooltip = document.createElement("div");
		tooltip.style.cssText = "position: absolute; left: 50px; top: 0px; background: rgba(0,0,0,0.9); color: #fff; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-family: 'FuturaHandwritten'; z-index: 10000; pointer-events: none; opacity: 0; transition: opacity 0.2s ease; max-width: 450px; width: 150px; white-space: normal;";
		tooltip.innerHTML = strategyDescriptions[peepID] || "";
		popDOM.appendChild(tooltip);
		
		// Show tooltip on hover
		popIcon.onmouseenter = function(){
			tooltip.style.opacity = "1";
		};
		popIcon.onmouseleave = function(){
			tooltip.style.opacity = "0";
		};
		
		// Label: Name
		var popName = document.createElement("div");
		popName.className = "sandbox_pop_label";
		popName.innerHTML = Words.get("label_short_"+peepID).toUpperCase();
		popName.style.color = PEEP_METADATA[peepID].color;
		popDOM.appendChild(popName);
		
		// Label: Amount
		var popAmount = document.createElement("div");
		popAmount.className = "sandbox_pop_label";
		popAmount.style.textAlign = "right";
		popAmount.style.color = PEEP_METADATA[peepID].color;
		popDOM.appendChild(popAmount);
		listen(self, message, function(value){
			popAmount.innerHTML = value;
		});
		
		// Slider
		(function(peepID){
			var popSlider = new Slider({
				x:0, y:35, width:200,
				min:0, max:50, step:1,
				message: message,
				onselect: function(){
					PopulationManager.anchor(peepID);
				},
				onchange: function(value){
					PopulationManager.adjust(peepID, value, function(strategy, count){
						publish("sandbox/pop/"+strategy, [count]);
					});
				}
			});
			sliders.push(popSlider);
			popSlider.slideshow = self.slideshow;
			popDOM.appendChild(popSlider.dom);
		})(peepID);
		
		// Default value!
		publish(message, [defaultValue]);
		
	};
	
	// Layout configuration
	var xDiff = 220;
	var yDiff = 80;
	var yOff = 40;
	_makePopulationControl(    0, yOff+0,       "tft",		6);
	_makePopulationControl(xDiff, yOff+0,       "all_d",	6);
	_makePopulationControl(    0, yOff+yDiff,   "all_c",	6);
	_makePopulationControl(xDiff, yOff+yDiff,   "grudge",	6);
	_makePopulationControl(    0, yOff+yDiff*2, "prober",	6);
	_makePopulationControl(xDiff, yOff+yDiff*2, "tf2t",		6);
	_makePopulationControl(    0, yOff+yDiff*3, "pavlov",	6);
	_makePopulationControl(xDiff, yOff+yDiff*3, "random",	8);
	
	// Cleanup
	self.remove = function(){
		for(var i=0; i<sliders.length; i++) unlisten(sliders[i]);
		unlisten(self);
	};
	
	return self;
}

