/**************************************
 * Population Manager Utility
 * Handles population adjustment logic
 **************************************/
var PopulationManager = {
	
	_population: null,
	_remainder: null,
	_anchoredIndex: null,
	
	anchor: function(peepID){
		// Which index should be anchored?
		this._anchoredIndex = Tournament.INITIAL_AGENTS.findIndex(function(config){
			return config.strategy == peepID;
		});
		var initValue = Tournament.INITIAL_AGENTS[this._anchoredIndex].count;
		
		// SPECIAL CASE: THIS IS ALREADY FULL
		if(initValue == 50){
			// Pretend it was 1 for all seven others, 50-7 for this.
			this._population = [];
			for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
				if(i == this._anchoredIndex){
					this._population.push(43);
				}else{
					this._population.push(1);
				}
			}
			// Remainder is 7
			this._remainder = 7;
		}else{
			// Create array of all initial agents...
			this._population = [];
			for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
				var conf = Tournament.INITIAL_AGENTS[i];
				this._population.push(conf.count);
			}
			// Remainder sum of those NOT anchored (50-anchor.count)
			this._remainder = 50 - initValue;
		}
	},
	
	adjust: function(peepID, value, onUpdate){
		// Change the anchored one
		Tournament.INITIAL_AGENTS.find(function(config){
			return config.strategy == peepID;
		}).count = value;
		
		// What's the scale for the rest of 'em?
		var newRemainder = 50 - value;
		var scale = newRemainder / this._remainder;
		
		// Adjust everyone to scale, ROUNDING.
		var total = 0;
		for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
			// do NOT adjust anchor.
			var conf = Tournament.INITIAL_AGENTS[i];
			if(conf.strategy == peepID) continue;
			
			var initCount = this._population[i];
			var newCount = Math.round(initCount * scale);
			conf.count = newCount;
			
			// Count total!
			total += newCount;
		}
		total += value; // total
		
		// Difference... 
		var diff = 50 - total;
		// If negative, remove one starting from BOTTOM, skipping anchor.
		// (UNLESS IT'S ZERO)
		if(diff < 0){
			for(var i=Tournament.INITIAL_AGENTS.length-1; i>=0 && diff<0; i--){
				// do NOT adjust anchor.
				var conf = Tournament.INITIAL_AGENTS[i];
				if(conf.strategy == peepID) continue;
				if(conf.count == 0) continue; // DON'T DO IT IF IT'S ZERO
				conf.count--; // REMOVE
				diff++; // yay
			}
		}
		// If positive, add one starting from TOP, skipping anchor.
		// (UNLESS IT'S ZERO)
		var everyoneElseWasZero = true;
		if(diff > 0){
			for(var i=0; i<Tournament.INITIAL_AGENTS.length && diff>0; i++){
				// do NOT adjust anchor.
				var conf = Tournament.INITIAL_AGENTS[i];
				if(conf.strategy == peepID) continue;
				if(conf.count == 0) continue; // DO NOT ADD IF ZERO
				everyoneElseWasZero = false;
				conf.count++; // ADD
				diff--; // yay
			}
		}
		// ...edge case. fine w/e
		if(everyoneElseWasZero){
			for(var i=0; i<Tournament.INITIAL_AGENTS.length && diff>0; i++){
				// do NOT adjust anchor.
				var conf = Tournament.INITIAL_AGENTS[i];
				if(conf.strategy == peepID) continue;
				conf.count++; // ADD
				diff--; // yay
			}
		}
		
		// NOW adjust UI via callback
		if(onUpdate){
			for(var i=0; i<Tournament.INITIAL_AGENTS.length; i++){
				// do NOT adjust anchor.
				var conf = Tournament.INITIAL_AGENTS[i];
				if(conf.strategy == peepID) continue;
				onUpdate(conf.strategy, conf.count);
			}
		}
		
		// Reset tournament
		publish("tournament/reset");
	}
	
};

