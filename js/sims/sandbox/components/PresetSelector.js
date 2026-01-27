/**************************************
 * Preset Selector Component
 * Dropdown for selecting game state presets
 **************************************/
function PresetSelector(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM
	self.dom = document.createElement("div");
	self.dom.id = "sandbox_preset_selector";
	self.dom.className = "sandbox_preset_selector";
	
	// Label
	var label = document.createElement("div");
	label.className = "sandbox_preset_label";
	label.innerHTML = "Initial State:";
	self.dom.appendChild(label);
	
	// Dropdown select element
	var select = document.createElement("select");
	select.className = "sandbox_preset_dropdown";
	
	// Populate with presets
	var presets = PresetManager.getPresetList();
	for(var i=0; i<presets.length; i++){
		var option = document.createElement("option");
		option.value = presets[i].id;
		option.textContent = presets[i].name;
		if(presets[i].description){
			option.title = presets[i].description;
		}
		select.appendChild(option);
	}
	
	// Set default selection
	if(presets.length > 0){
		select.value = presets[0].id; // Default to first preset
	}
	
	// Handle selection change
	select.onchange = function(){
		var presetId = select.value;
		if(presetId){
			PresetManager.applyPreset(presetId);
		}
	};
	
	self.dom.appendChild(select);
	
	// Store reference to select for potential external updates
	self.select = select;
	
	// Method to programmatically set preset
	self.setPreset = function(presetId){
		if(PresetManager.PRESETS[presetId]){
			select.value = presetId;
			PresetManager.applyPreset(presetId);
		}
	};
	
	// Cleanup
	self.remove = function(){
		// No subscriptions to clean up
	};
	
	return self;
}

