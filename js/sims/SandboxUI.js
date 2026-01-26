function SandboxUI(config){

	var self = this;
	self.id = config.id;
	self.slideshow = config.slideshow;

	// Create DOM
	self.dom = document.createElement("div");
	self.dom.className = "object";
	var dom = self.dom;

	/////////////////////////////////////////
	// TOTAL SCORE LABEL ////////////////////
	/////////////////////////////////////////
	
	var totalScoreLabel = document.createElement("div");
	totalScoreLabel.id = "sandbox_total_score_label";
	totalScoreLabel.style.cssText = "position: fixed; left: 20px; top: 20px; font-family: 'FuturaHandwritten'; font-size: 18px; color: #333; z-index: 1001;";
	totalScoreLabel.innerHTML = "Total score : 0";
	dom.appendChild(totalScoreLabel);
	
	var updateTotalScore = function(){
		var total = 0;
		if(slideshow.objects.tournament && slideshow.objects.tournament.agents){
			for(var i=0; i<slideshow.objects.tournament.agents.length; i++){
				total += slideshow.objects.tournament.agents[i].coins || 0;
			}
		}
		var words = Words.get("sandbox_total_score");
		words = words.replace(/\[X\]/g, total+"");
		totalScoreLabel.innerHTML = words;
	};
	
	// Update score after tournament completes
	listen(self, "tournament/step/completed", function(stage){
		if(stage === "play"){
			updateTotalScore();
		}
	});
	
	// Update score when tournament resets
	listen(self, "tournament/reset", function(){
		// Use setTimeout to ensure agents are reset first
		setTimeout(updateTotalScore, 10);
	});
	
	// Initialize score (with a small delay to ensure tournament is created)
	setTimeout(updateTotalScore, 100);

	/////////////////////////////////////////
	// BUTTONS for playing //////////////////
	/////////////////////////////////////////

	var playButton = new Button({
		x:300, y:200, text_id:"label_start", size:"short",
		onclick: function(){
			if(slideshow.objects.tournament.isAutoPlaying){
				publish("tournament/autoplay/stop");
			}else{
				publish("tournament/autoplay/start");
			}
		}
	});
	listen(self, "tournament/autoplay/stop",function(){
		playButton.setText("label_start");
	});
	listen(self, "tournament/autoplay/start",function(){
		playButton.setText("label_stop");
	});
	dom.appendChild(playButton.dom);

	var stepButton = new Button({
		x:300, y:200+70, text_id:"label_step", message:"tournament/step", size:"short"
	});
	dom.appendChild(stepButton.dom);
	
	var resetButton = new Button({x:300, y:200+70*2, text_id:"label_reset", message:"tournament/reset", size:"short"});
	dom.appendChild(resetButton.dom);

	/////////////////////////////////////////
	// Create TABS & PAGES //////////////////
	/////////////////////////////////////////

	// Tabs
	var tabs = document.createElement("div");
	tabs.id = "sandbox_tabs";
	dom.appendChild(tabs);

	// Tab Hitboxes
	var hitboxes = [];
	var MAX_TABS_WIDTH = 500; // Match sandbox page width
	var TAB_COUNT = 4;
	var INACTIVE_TAB_WIDTH = Math.floor((MAX_TABS_WIDTH - 2) / TAB_COUNT); // -2 for borders, divide by 4 tabs
	
	var currentTabX = 0;
	var _makeHitbox = function(label, pageIndex){

		label = label.toUpperCase();

		var hitbox = document.createElement("div");
		hitbox.className = "hitbox";
		hitbox.innerHTML = label;
		tabs.appendChild(hitbox);
		hitboxes.push(hitbox);

		// Inactive tabs have fixed smaller width
		// Active tab will expand to show full text
		var tabWidth = INACTIVE_TAB_WIDTH;
		
		hitbox.style.width = tabWidth + "px";
		hitbox.style.left = currentTabX + "px";
		
		// Next tab starts right after this one (no gap)
		currentTabX += tabWidth;

		(function(pageIndex, hitboxElement){
			hitboxElement.onclick = function(){
				_goToPage(pageIndex);
			};
		})(pageIndex, hitbox);

	};
	_makeHitbox(Words.get("label_population"), 0);
	_makeHitbox("RELATIONSHIP", 1);
	_makeHitbox(Words.get("label_payoffs"), 2);
	_makeHitbox(Words.get("label_rules"), 3);

	// Pages
	var pages = [];
	var _makePage = function(){
		var page = document.createElement("div");
		page.className = "sandbox_page";
		tabs.appendChild(page);
		pages.push(page);
	};
	for(var i=0; i<4; i++) _makePage(); // make four pages

	// Go To Page
	var _goToPage = function(showIndex){

		// Calculate width for active tab (full text)
		var activeLabel = hitboxes[showIndex].innerHTML;
		var tempMeasure = document.createElement("div");
		tempMeasure.style.cssText = "position:absolute; visibility:hidden; font-size:18px; padding:0 12px; white-space:nowrap;";
		tempMeasure.innerHTML = activeLabel;
		document.body.appendChild(tempMeasure);
		var activeTextWidth = tempMeasure.offsetWidth;
		document.body.removeChild(tempMeasure);
		var activeTabWidth = activeTextWidth + 24 + 2; // padding + border
		
		// Calculate remaining width for inactive tabs
		var remainingWidth = MAX_TABS_WIDTH - activeTabWidth - 2; // -2 for borders
		var inactiveTabWidth = Math.floor(remainingWidth / (TAB_COUNT - 1));
		
		// Update tab widths and styling
		var currentX = 0;
		for(var i=0; i<hitboxes.length; i++){
			if(i === showIndex){
				hitboxes[i].classList.add("active");
				hitboxes[i].style.width = activeTabWidth + "px";
			} else {
				hitboxes[i].classList.remove("active");
				hitboxes[i].style.width = inactiveTabWidth + "px";
			}
			hitboxes[i].style.left = currentX + "px";
			currentX += parseInt(hitboxes[i].style.width);
		}

		// Show page
		for(var i=0; i<pages.length; i++) pages[i].style.display = "none";
		pages[showIndex].style.display = "block";

	};
	_goToPage(0);

	/////////////////////////////////////////
	// PAGE 0: POPULATION ///////////////////
	/////////////////////////////////////////

	var page = pages[0];

	// Labels
	page.appendChild(_makeLabel("sandbox_population", {x:0, y:0, w:433}));

	// Create an icon, label, and slider... that all interact with each other.
	var sliders = [];
	var _makePopulationControl = function(x, y, peepID, defaultValue){

		// DOM
		var popDOM = document.createElement("div");
		popDOM.className = "sandbox_pop";
		popDOM.style.left = x;
		popDOM.style.top = y;
		page.appendChild(popDOM);

		// Message
		var message = "sandbox/pop/"+peepID;

		// Icon
		var popIcon = document.createElement("div");
		popIcon.className = "sandbox_pop_icon";
		popIcon.style.backgroundPosition = (-PEEP_METADATA[peepID].frame*40)+"px 0px";
		popDOM.appendChild(popIcon);

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
					_anchorPopulation(peepID);
				},
				onchange: function(value){
					_adjustPopulation(peepID, value);
				}
			});
			sliders.push(popSlider);
			popSlider.slideshow = self.slideshow;
			popDOM.appendChild(popSlider.dom);
		})(peepID);

		// Default value!
		publish(message, [defaultValue]);

	};
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

	// Adjust the WHOLE population...
	/******************************

	Adjust by SCALING. (and in the edge case of "all zero", scale equally)
	Round to integers. (if above or below 50 in total, keep adding/subtracting 1 down the line)

	******************************/
	var _population;
	var _remainder;
	var _anchoredIndex;
	var _anchorPopulation = function(peepID){

		// Which index should be anchored?
		_anchoredIndex = Tournament.INITIAL_AGENTS.findIndex(function(config){
			return config.strategy==peepID;
		});
		var initValue = Tournament.INITIAL_AGENTS[_anchoredIndex].count;

		// SPECIAL CASE: THIS IS ALREADY FULL
		if(initValue==50){

			// Pretend it was 1 for all seven others, 50-7 for this.
			_population = [];
			for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
				if(i==_anchoredIndex){
					_population.push(43);
				}else{
					_population.push(1);
				}
			}

			// Remainder is 7
			_remainder = 7;

		}else{

			// Create array of all initial agents...
			_population = [];
			for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
				var conf = Tournament.INITIAL_AGENTS[i];
				_population.push(conf.count);
			}

			// Remainder sum of those NOT anchored (50-anchor.count)
			_remainder = 50-initValue;

		}

	};
	var _adjustPopulation = function(peepID, value){

		// Change the anchored one
		Tournament.INITIAL_AGENTS.find(function(config){
			return config.strategy==peepID;
		}).count = value;
		
		// What's the scale for the rest of 'em?
		var newRemainder = 50-value;
		var scale = newRemainder/_remainder;

		// Adjust everyone to scale, ROUNDING.
		var total = 0;
		for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){

			// do NOT adjust anchor.
			var conf = Tournament.INITIAL_AGENTS[i];
			if(conf.strategy==peepID) continue;

			var initCount = _population[i];
			var newCount = Math.round(initCount*scale);
			conf.count = newCount;

			// Count total!
			total += newCount;

		}
		total += value; // total

		// Difference... 
		var diff = 50-total;
		// If negative, remove one starting from BOTTOM, skipping anchor.
		// (UNLESS IT'S ZERO)
		if(diff<0){
			for(var i=Tournament.INITIAL_AGENTS.length-1; i>=0 && diff<0; i--){
				// do NOT adjust anchor.
				var conf = Tournament.INITIAL_AGENTS[i];
				if(conf.strategy==peepID) continue;
				if(conf.count==0) continue; // DON'T DO IT IF IT'S ZERO
				conf.count--; // REMOVE
				diff++; // yay
			}
		}
		// If positive, add one starting from TOP, skipping anchor.
		// (UNLESS IT'S ZERO)
		var everyoneElseWasZero = true;
		if(diff>0){
			for(var i=0; i<Tournament.INITIAL_AGENTS.length && diff>0; i++){
				// do NOT adjust anchor.
				var conf = Tournament.INITIAL_AGENTS[i];
				if(conf.strategy==peepID) continue;
				if(conf.count==0) continue; // DO NOT ADD IF ZERO
				everyoneWasZero = false;
				conf.count++; // ADD
				diff--; // yay
			}
		}
		// ...edge case. fine w/e
		if(everyoneElseWasZero){
			for(var i=0; i<Tournament.INITIAL_AGENTS.length && diff>0; i++){
				// do NOT adjust anchor.
				var conf = Tournament.INITIAL_AGENTS[i];
				if(conf.strategy==peepID) continue;
				// if(conf.count==0) continue; // DO NOT ADD IF ZERO
				// everyoneWasZero = false;
				conf.count++; // ADD
				diff--; // yay
			}
		}

		// NOW adjust UI
		for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
			// do NOT adjust anchor.
			var conf = Tournament.INITIAL_AGENTS[i];
			if(conf.strategy==peepID) continue;
			publish("sandbox/pop/"+conf.strategy, [conf.count]);
		}

		// Reset!
		publish("tournament/reset");

	};

	/////////////////////////////////////////
	// PAGE 1: RELATIONSHIP /////////////////
	/////////////////////////////////////////

	var page = pages[1];


	// Connection Count Slider
	var relationshipLabel = _makeLabel("sandbox_relationship_connections", {x:0, y:5, w:433});
	
	// Function to calculate max connections (total players - 1, rounded down to even number)
	var getMaxConnections = function(){
		var totalPlayers = 0;
		for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
			totalPlayers += Tournament.INITIAL_AGENTS[i].count;
		}
		var maxConnections = totalPlayers - 1;
		// Round down to nearest even number
		if(maxConnections % 2 !== 0){
			maxConnections = maxConnections - 1;
		}
		return Math.max(0, maxConnections); // Allow 0 (no connections)
	};
	
	var slider_connections = new Slider({
		x:0, y:50, width:430,
		min:0, max:getMaxConnections(), step:2, // Even numbers only (0, 2, 4, 6, ...)
		message: "rules/connections"
	});
	sliders.push(slider_connections);
	slider_connections.slideshow = self.slideshow;
	
	// Update slider max when population changes (listen to any population change)
	var updateConnectionSliderMax = function(){
		var newMax = getMaxConnections();
		slider_connections.setMax(newMax);
		// If current value exceeds new max, clamp it
		var currentValue = Tournament.CONNECTION_COUNT || 0;
		if(currentValue > newMax){
			publish("rules/connections", [newMax]);
		}
	};
	
	// Listen to all population changes
	for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
		var peepID = Tournament.INITIAL_AGENTS[i].strategy;
		listen(self, "sandbox/pop/"+peepID, updateConnectionSliderMax);
	}
	
	listen(self, "rules/connections", function(value){
		var words = Words.get("sandbox_relationship_connections");
		words = words.replace(/\[N\]/g, value+"");
		relationshipLabel.innerHTML = words;
		// Update tournament connection pattern
		if(slideshow.objects.tournament){
			slideshow.objects.tournament.setConnectionPattern(
				value,
				Tournament.RANDOM_CONNECTION_PROBABILITY
			);
		}
	});
	page.appendChild(relationshipLabel);
	page.appendChild(slider_connections.dom);

	// Initialize with default value
	publish("rules/connections", [Tournament.CONNECTION_COUNT]);

	// Random Connection Probability Slider
	var randomLabel = _makeLabel("sandbox_relationship_random", {x:0, y:110, w:433});
	
	var slider_random = new Slider({
		x:0, y:155, width:430,
		min:0, max:5, step:0.1,
		message: "rules/random_connections"
	});
	sliders.push(slider_random);
	slider_random.slideshow = self.slideshow;
	
	listen(self, "rules/random_connections", function(value){
		var words = Words.get("sandbox_relationship_random");
		words = words.replace(/\[P\]/g, value.toFixed(1)+"");
		randomLabel.innerHTML = words;
		// Update tournament connection pattern
		if(slideshow.objects.tournament){
			slideshow.objects.tournament.setConnectionPattern(
				Tournament.CONNECTION_COUNT,
				value
			);
		}
	});
	page.appendChild(randomLabel);
	page.appendChild(slider_random.dom);

	// Initialize with default value
	publish("rules/random_connections", [Tournament.RANDOM_CONNECTION_PROBABILITY]);

	/////////////////////////////////////////
	// PAGE 2: PAYOFFS //////////////////////
	/////////////////////////////////////////

	var page = pages[2];

	// Labels
	page.appendChild(_makeLabel("sandbox_payoffs", {x:0, y:0, w:433}));
	
	// PAYOFFS
	var payoffsUI = new PayoffsUI({x:84, y:41, scale:0.9, slideshow:self});
	page.appendChild(payoffsUI.dom);

	// Reset
	var resetPayoffs = new Button({
		x:240, y:300, text_id:"sandbox_reset_payoffs",
		message:"pd/defaultPayoffs"
	});
	page.appendChild(resetPayoffs.dom);

	/////////////////////////////////////////
	// PAGE 3: RULES ////////////////////////
	/////////////////////////////////////////

	var page = pages[3];

	// Rule: Number of turns (1 to 50)
	var rule_turns = _makeLabel("sandbox_rules_1", {x:0, y:0, w:433});
	var slider_turns = new Slider({
		x:0, y:35, width:430,
		min:1, max:50, step:1,
		message: "rules/turns"
	});
	sliders.push(slider_turns);
	slider_turns.slideshow = self.slideshow;
	listen(self, "rules/turns",function(value){
		var words = (value==1) ? Words.get("sandbox_rules_1_single") : Words.get("sandbox_rules_1"); // plural?
		words = words.replace(/\[N\]/g, value+""); // replace [N] with the number value
		rule_turns.innerHTML = words;
	});
	page.appendChild(rule_turns);
	page.appendChild(slider_turns.dom);

	// Rule: Eliminate/Reproduce how many? (1 to 12)
	var rule_evolution = _makeLabel("sandbox_rules_2", {x:0, y:100, w:433});
	var slider_evolution = new Slider({
		x:0, y:165, width:430,
		min:1, max:10, step:1,
		message: "rules/evolution"
	});
	sliders.push(slider_evolution);
	slider_evolution.slideshow = self.slideshow;
	listen(self, "rules/evolution",function(value){
		var words = (value==1) ? Words.get("sandbox_rules_2_single") : Words.get("sandbox_rules_2"); // plural?
		words = words.replace(/\[N\]/g, value+""); // replace [N] with the number value
		rule_evolution.innerHTML = words;
	});
	page.appendChild(rule_evolution);
	page.appendChild(slider_evolution.dom);

	// Rule: Noise (0% to 50%)
	var rule_noise = _makeLabel("sandbox_rules_3", {x:0, y:225, w:433});
	var slider_noise = new Slider({
		x:0, y:290, width:430,
		min:0.00, max:0.50, step:0.01,
		message: "rules/noise"
	});
	sliders.push(slider_noise);
	slider_noise.slideshow = self.slideshow;
	listen(self, "rules/noise",function(value){
		value = Math.round(value*100);
		var words = Words.get("sandbox_rules_3");
		words = words.replace(/\[N\]/g, value+""); // replace [N] with the number value
		rule_noise.innerHTML = words;
	});
	page.appendChild(rule_noise);
	page.appendChild(slider_noise.dom);

	// DEFAULTS
	publish("rules/turns", [10]);
	publish("rules/evolution", [5]);
	publish("rules/noise", [0.05]);

	/////////////////////////////////////////
	// Add & Remove Object //////////////////
	/////////////////////////////////////////
	
	// Add...
	self.add = function(){
		_add(self);
	};

	// Remove...
	self.remove = function(){
		payoffsUI.remove();
		//for(var i=0;i<numbers.length;i++) unlisten(numbers[i]);
		for(var i=0;i<sliders.length;i++) unlisten(sliders[i]);
		unlisten(self);
		_remove(self);
	};

}