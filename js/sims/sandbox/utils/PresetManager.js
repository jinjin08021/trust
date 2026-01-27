/**************************************
 * Preset Manager
 * Manages game state presets for the sandbox
 **************************************/
var PresetManager = {};

// Define all available presets
PresetManager.PRESETS = {
	"interconnected_society": {
		name: "Interconnected Society",
		description: "Default settings with high connectivity",
		population: [
			{strategy:"tft", count:6},
			{strategy:"all_d", count:6},
			{strategy:"all_c", count:6},
			{strategy:"grudge", count:6},
			{strategy:"prober", count:6},
			{strategy:"tf2t", count:6},
			{strategy:"pavlov", count:6},
			{strategy:"random", count:8}
		],
		connections: {
			global: 48,
			randomProbability: 0,
			strategyCounts: {
				"tft": 0,
				"all_d": 0,
				"prober": 0,
				"all_c": 0
			},
			strategyShuffle: {
				"tft": false,
				"all_d": false,
				"prober": false,
				"all_c": false
			}
		},
		payoffs: {
			P: 0,
			S: -1,
			R: 2,
			T: 3
		},
		rules: {
			turns: 10,
			evolution: 5,
			noise: 0
		}
	},
	"close_knit_community": {
		name: "Close-Knit Community",
		description: "Same as Interconnected Society but with only 4 neighbors per player",
		population: [
			{strategy:"tft", count:6},
			{strategy:"all_d", count:6},
			{strategy:"all_c", count:6},
			{strategy:"grudge", count:6},
			{strategy:"prober", count:6},
			{strategy:"tf2t", count:6},
			{strategy:"pavlov", count:6},
			{strategy:"random", count:8}
		],
		connections: {
			global: 4,
			randomProbability: 0,
			strategyCounts: {
				"tft": 0,
				"all_d": 0,
				"prober": 0,
				"all_c": 0
			},
			strategyShuffle: {
				"tft": false,
				"all_d": false,
				"prober": false,
				"all_c": false
			}
		},
		payoffs: {
			P: 0,
			S: -1,
			R: 2,
			T: 3
		},
		rules: {
			turns: 10,
			evolution: 5,
			noise: 0.05
		}
	}
	// More presets can be added here easily
};

// Get the current game state as a preset object
PresetManager.getCurrentState = function(){
	return {
		population: JSON.parse(JSON.stringify(Tournament.INITIAL_AGENTS)),
		connections: {
			global: Tournament.CONNECTION_COUNT || 0,
			randomProbability: Tournament.RANDOM_CONNECTION_PROBABILITY || 0,
			strategyCounts: JSON.parse(JSON.stringify(Tournament.STRATEGY_CONNECTION_COUNTS || {})),
			strategyShuffle: JSON.parse(JSON.stringify(Tournament.STRATEGY_SHUFFLE_MODE || {}))
		},
		payoffs: JSON.parse(JSON.stringify(PD.PAYOFFS || PD.PAYOFFS_DEFAULT)),
		rules: {
			turns: Tournament.NUM_TURNS || 10,
			evolution: Tournament.SELECTION || 5,
			noise: PD.NOISE || 0
		}
	};
};

// Apply a preset to the game state
PresetManager.applyPreset = function(presetId){
	var preset = PresetManager.PRESETS[presetId];
	if(!preset){
		console.warn("Preset not found:", presetId);
		return;
	}
	
	// Apply population
	if(preset.population){
		Tournament.INITIAL_AGENTS = JSON.parse(JSON.stringify(preset.population));
		for(var i=0; i<preset.population.length; i++){
			var agent = preset.population[i];
			publish("sandbox/pop/"+agent.strategy, [agent.count]);
		}
	}
	
	// Apply connections
	if(preset.connections){
		if(preset.connections.global !== undefined){
			Tournament.CONNECTION_COUNT = preset.connections.global;
			publish("rules/connections", [preset.connections.global]);
		}
		if(preset.connections.randomProbability !== undefined){
			Tournament.RANDOM_CONNECTION_PROBABILITY = preset.connections.randomProbability;
			publish("rules/random_connections", [preset.connections.randomProbability]);
		}
		if(preset.connections.strategyCounts){
			Tournament.STRATEGY_CONNECTION_COUNTS = JSON.parse(JSON.stringify(preset.connections.strategyCounts));
			for(var strategy in preset.connections.strategyCounts){
				publish("rules/strategy_connections/"+strategy, [preset.connections.strategyCounts[strategy]]);
			}
		}
		if(preset.connections.strategyShuffle){
			Tournament.STRATEGY_SHUFFLE_MODE = JSON.parse(JSON.stringify(preset.connections.strategyShuffle));
			for(var strategy in preset.connections.strategyShuffle){
				publish("rules/strategy_shuffle/"+strategy, [preset.connections.strategyShuffle[strategy]]);
			}
		}
	}
	
	// Apply payoffs
	if(preset.payoffs){
		PD.PAYOFFS = JSON.parse(JSON.stringify(preset.payoffs));
		publish("pd/editPayoffs/P", [preset.payoffs.P]);
		publish("pd/editPayoffs/S", [preset.payoffs.S]);
		publish("pd/editPayoffs/R", [preset.payoffs.R]);
		publish("pd/editPayoffs/T", [preset.payoffs.T]);
	}
	
	// Apply rules
	if(preset.rules){
		if(preset.rules.turns !== undefined){
			Tournament.NUM_TURNS = preset.rules.turns;
			publish("rules/turns", [preset.rules.turns]);
		}
		if(preset.rules.evolution !== undefined){
			Tournament.SELECTION = preset.rules.evolution;
			publish("rules/evolution", [preset.rules.evolution]);
		}
		if(preset.rules.noise !== undefined){
			PD.NOISE = preset.rules.noise;
			publish("rules/noise", [preset.rules.noise]);
		}
	}
	
	// Reset tournament to apply changes
	publish("tournament/reset");
};

// Get list of all preset IDs and names
PresetManager.getPresetList = function(){
	var list = [];
	for(var id in PresetManager.PRESETS){
		list.push({
			id: id,
			name: PresetManager.PRESETS[id].name,
			description: PresetManager.PRESETS[id].description
		});
	}
	return list;
};

