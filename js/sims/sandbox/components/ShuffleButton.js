/**************************************
 * Shuffle Button Component
 * Button to shuffle player positions in the tournament ring
 **************************************/
function ShuffleButton(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM container
	self.dom = document.createElement("div");
	self.dom.className = "object";
	
	// Create custom button (not using Button component)
	var button = document.createElement("button");
	button.className = "shuffle-button-custom";
	button.innerHTML = Words.get("label_shuffle");
	button.style.left = "-20px";
	button.style.top = "-20px";
	button.style.position = "absolute";
	
	// Handle click
	button.onclick = function(){
		publish("tournament/shuffle");
	};
	
	self.dom.appendChild(button);
	
	// Store reference
	self.button = button;
	
	// Cleanup
	self.remove = function(){
		// No subscriptions to clean up
	};
	
	return self;
}

