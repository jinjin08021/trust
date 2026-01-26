/**************************************
 * Rules Page Component
 * Manages tournament rules (turns, evolution, noise)
 **************************************/
function RulesPage(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM
	self.dom = document.createElement("div");
	self.dom.className = "sandbox_page";
	
	var sliders = [];
	
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
	self.dom.appendChild(rule_turns);
	self.dom.appendChild(slider_turns.dom);
	
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
	self.dom.appendChild(rule_evolution);
	self.dom.appendChild(slider_evolution.dom);
	
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
	self.dom.appendChild(rule_noise);
	self.dom.appendChild(slider_noise.dom);
	
	// DEFAULTS
	publish("rules/turns", [10]);
	publish("rules/evolution", [5]);
	publish("rules/noise", [0.05]);
	
	// Cleanup
	self.remove = function(){
		for(var i=0; i<sliders.length; i++) unlisten(sliders[i]);
		unlisten(self);
	};
	
	return self;
}

