/**************************************
 * Sandbox UI - Main Component
 * Orchestrates all sandbox UI components
 **************************************/
function SandboxUI(config){

	var self = this;
	self.id = config.id;
	self.slideshow = config.slideshow;

	// Create DOM
	self.dom = document.createElement("div");
	self.dom.className = "object";
	var dom = self.dom;

	// Compose components
	self.totalScore = new TotalScoreLabel({slideshow: self.slideshow});
	self.controlButtons = new ControlButtons({slideshow: self.slideshow});
	self.presetSelector = new PresetSelector({slideshow: self.slideshow});
	self.shuffleButton = new ShuffleButton({slideshow: self.slideshow});
	
	// Create pages
	var populationPage = new PopulationPage({slideshow: self.slideshow});
	var relationshipPage = new RelationshipPage({slideshow: self.slideshow});
	var payoffsPage = new PayoffsPage({slideshow: self.slideshow});
	var rulesPage = new RulesPage({slideshow: self.slideshow});
	
	// Create tab system
	self.tabSystem = new TabSystem({
		pages: [
			{label: Words.get("label_population"), page: populationPage},
			{label: "RELATIONSHIP", page: relationshipPage},
			{label: Words.get("label_payoffs"), page: payoffsPage},
			{label: Words.get("label_rules"), page: rulesPage}
		]
	});
	
	// Store page references for cleanup
	self.pages = [populationPage, relationshipPage, payoffsPage, rulesPage];

	// Assemble DOM
	dom.appendChild(self.totalScore.dom);
	dom.appendChild(self.controlButtons.dom);
	dom.appendChild(self.presetSelector.dom);
	dom.appendChild(self.shuffleButton.dom);
	dom.appendChild(self.tabSystem.dom);

	/////////////////////////////////////////
	// Add & Remove Object //////////////////
	/////////////////////////////////////////
	
	// Add...
	self.add = function(){
		_add(self);
	};

	// Remove...
	self.remove = function(){
		// Cleanup all pages
		for(var i=0; i<self.pages.length; i++){
			if(self.pages[i].remove){
				self.pages[i].remove();
			}
		}
		// Cleanup components
		if(self.totalScore.remove) self.totalScore.remove();
		if(self.controlButtons.remove) self.controlButtons.remove();
		if(self.presetSelector.remove) self.presetSelector.remove();
		if(self.shuffleButton.remove) self.shuffleButton.remove();
		unlisten(self);
		_remove(self);
	};

}
