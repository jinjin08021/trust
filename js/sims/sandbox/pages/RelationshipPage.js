/**************************************
 * Relationship Page Component
 * Manages connection settings and strategy-specific connections
 **************************************/
function RelationshipPage(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM
	self.dom = document.createElement("div");
	self.dom.className = "sandbox_page";
	
	var sliders = [];
	
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
	
	// Connection Count Slider
	var relationshipLabel = _makeLabel("sandbox_relationship_connections", {x:0, y:5, w:433});
	
	var slider_connections = new Slider({
		x:0, y:40, width:430,
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
		if(self.slideshow.objects.tournament){
			self.slideshow.objects.tournament.setConnectionPattern(
				value,
				Tournament.RANDOM_CONNECTION_PROBABILITY,
				Tournament.STRATEGY_CONNECTION_COUNTS,
				Tournament.STRATEGY_SHUFFLE_MODE
			);
		}
	});
	self.dom.appendChild(relationshipLabel);
	self.dom.appendChild(slider_connections.dom);
	
	// Initialize with default value
	publish("rules/connections", [Tournament.CONNECTION_COUNT]);
	
	// Random Connection Probability Slider
	var randomLabel = _makeLabel("sandbox_relationship_random", {x:0, y:85, w:433});
	
	var slider_random = new Slider({
		x:0, y:120, width:430,
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
		if(self.slideshow.objects.tournament){
			self.slideshow.objects.tournament.setConnectionPattern(
				Tournament.CONNECTION_COUNT,
				value,
				Tournament.STRATEGY_CONNECTION_COUNTS,
				Tournament.STRATEGY_SHUFFLE_MODE
			);
		}
	});
	self.dom.appendChild(randomLabel);
	self.dom.appendChild(slider_random.dom);
	
	// Initialize with default value
	publish("rules/random_connections", [Tournament.RANDOM_CONNECTION_PROBABILITY]);
	
	// Strategy-specific neighbor connection sliders
	var strategySectionLabel = _makeLabel("sandbox_relationship_strategy_random", {x:0, y:165, w:433});
	self.dom.appendChild(strategySectionLabel);
	
	// Helper function to create strategy connection count slider
	var _makeStrategyConnectionSlider = function(x, y, strategyID, strategyLabelID){
		// Create container similar to population controls
		var strategyDOM = document.createElement("div");
		strategyDOM.className = "sandbox_pop";
		strategyDOM.style.left = x + "px";
		strategyDOM.style.top = y + "px";
		self.dom.appendChild(strategyDOM);
		
		// Icon
		var strategyIcon = document.createElement("div");
		strategyIcon.className = "sandbox_pop_icon";
		strategyIcon.style.backgroundPosition = (-PEEP_METADATA[strategyID].frame*40)+"px 0px";
		strategyDOM.appendChild(strategyIcon);
		
		// Label: Name (capitalized, with color)
		var strategyName = document.createElement("div");
		strategyName.className = "sandbox_pop_label";
		strategyName.innerHTML = Words.get(strategyLabelID).toUpperCase();
		strategyName.style.color = PEEP_METADATA[strategyID].color;
		// Make cooperator font slightly smaller
		if(strategyID === "all_c"){
			strategyName.style.fontSize = "16px";
		}
		strategyDOM.appendChild(strategyName);
		
		// Label: Connection Count (similar to population amount)
		var connectionCountLabel = document.createElement("div");
		connectionCountLabel.className = "sandbox_pop_label";
		connectionCountLabel.style.textAlign = "right";
		connectionCountLabel.style.color = PEEP_METADATA[strategyID].color;
		connectionCountLabel.style.width = "120px"; // Limit width to prevent overlap with shuffle button
		// Move count further right for cheater and cooperator
		var countLeft = (strategyID === "all_d" || strategyID === "all_c") ? "65px" : "50px";
		connectionCountLabel.style.left = countLeft; // Position from left, leaving room for shuffle button
		strategyDOM.appendChild(connectionCountLabel);
		
		// Shuffle Button (icon only, no button UI)
		var shuffleButton = document.createElement("div");
		shuffleButton.className = "sandbox_shuffle_button";
		// Move shuffle button further right for cheater and cooperator
		var shuffleLeft = (strategyID === "all_d" || strategyID === "all_c") ? "195px" : "180px";
		shuffleButton.style.cssText = "position: absolute; left: " + shuffleLeft + "; top: 5px; " +
			"cursor: pointer; display: flex; align-items: center; justify-content: center; " +
			"font-size: 24px; transition: opacity 0.2s ease, transform 0.2s ease; " +
			"user-select: none; width: 30px; height: 30px;";
		shuffleButton.innerHTML = "🔀";
		shuffleButton.title = "Shuffle: Random connections instead of neighbors";
		
		var isShuffled = Tournament.STRATEGY_SHUFFLE_MODE[strategyID] || false;
		var updateShuffleButton = function(){
			if(isShuffled){
				shuffleButton.style.opacity = "1";
				shuffleButton.style.filter = "none";
			} else {
				shuffleButton.style.opacity = "0.5";
				shuffleButton.style.filter = "grayscale(100%)";
			}
		};
		updateShuffleButton();
		
		shuffleButton.onmouseover = function(){
			shuffleButton.style.opacity = "1";
			shuffleButton.style.transform = "scale(1.1)";
		};
		shuffleButton.onmouseout = function(){
			updateShuffleButton();
			shuffleButton.style.transform = "scale(1)";
		};
		
		shuffleButton.onmousedown = function(){
			shuffleButton.style.transform = "scale(0.9)";
		};
		shuffleButton.onmouseup = function(){
			shuffleButton.style.transform = isShuffled ? "scale(1.1)" : "scale(1)";
		};
		
		shuffleButton.onclick = function(){
			isShuffled = !isShuffled;
			Tournament.STRATEGY_SHUFFLE_MODE[strategyID] = isShuffled;
			updateShuffleButton();
			publish("rules/strategy_shuffle/"+strategyID, [isShuffled]);
			// Update tournament connection pattern
			if(self.slideshow.objects.tournament){
				self.slideshow.objects.tournament.setConnectionPattern(
					Tournament.CONNECTION_COUNT,
					Tournament.RANDOM_CONNECTION_PROBABILITY,
					Tournament.STRATEGY_CONNECTION_COUNTS,
					Tournament.STRATEGY_SHUFFLE_MODE
				);
			}
		};
		strategyDOM.appendChild(shuffleButton);
		
		// Create a custom message for this strategy
		var strategyMessage = "rules/strategy_connections/"+strategyID;
		
		// Function to calculate max connections (total players - 1, rounded down to even number)
		var getMaxConnectionsForStrategy = function(){
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
		
		var slider = new Slider({
			x:0, y:35, width:200,
			min:0, max:getMaxConnectionsForStrategy(), step:2, // Even numbers only (0, 2, 4, 6, ...)
			message: strategyMessage
		});
		sliders.push(slider);
		slider.slideshow = self.slideshow;
		
		// Listen for changes to this specific strategy
		listen(self, strategyMessage, function(value){
			Tournament.STRATEGY_CONNECTION_COUNTS[strategyID] = value;
			// Update the connection count label
			connectionCountLabel.innerHTML = value;
			// Update tournament connection pattern
			if(self.slideshow.objects.tournament){
				self.slideshow.objects.tournament.setConnectionPattern(
					Tournament.CONNECTION_COUNT,
					Tournament.RANDOM_CONNECTION_PROBABILITY,
					Tournament.STRATEGY_CONNECTION_COUNTS,
					Tournament.STRATEGY_SHUFFLE_MODE
				);
			}
		});
		
		// Listen for shuffle mode changes
		listen(self, "rules/strategy_shuffle/"+strategyID, function(value){
			isShuffled = value;
			updateShuffleButton();
		});
		
		// Update slider max when population changes
		var updateSliderMax = function(){
			var newMax = getMaxConnectionsForStrategy();
			slider.setMax(newMax);
			var currentValue = Tournament.STRATEGY_CONNECTION_COUNTS[strategyID] || 0;
			if(currentValue > newMax){
				publish(strategyMessage, [newMax]);
			}
		};
		for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
			var peepID = Tournament.INITIAL_AGENTS[i].strategy;
			listen(self, "sandbox/pop/"+peepID, updateSliderMax);
		}
		
		strategyDOM.appendChild(slider.dom);
		
		// Initialize with default value
		var defaultValue = Tournament.STRATEGY_CONNECTION_COUNTS[strategyID] || 0;
		slider.setValue(defaultValue);
		connectionCountLabel.innerHTML = defaultValue; // Initialize the count label
		publish(strategyMessage, [defaultValue]);
	};
	
	// Create sliders for the four strategies
	var strategyY = 200;
	var strategyX1 = 0;
	var strategyX2 = 220;
	_makeStrategyConnectionSlider(strategyX1, strategyY, "tft", "label_short_tft"); // Copycat
	_makeStrategyConnectionSlider(strategyX2, strategyY, "all_d", "label_short_all_d"); // Cheater
	_makeStrategyConnectionSlider(strategyX1, strategyY + 80, "prober", "label_short_prober"); // Detective
	_makeStrategyConnectionSlider(strategyX2, strategyY + 80, "all_c", "label_short_all_c"); // Cooperator
	
	// Cleanup
	self.remove = function(){
		for(var i=0; i<sliders.length; i++) unlisten(sliders[i]);
		unlisten(self);
	};
	
	return self;
}

