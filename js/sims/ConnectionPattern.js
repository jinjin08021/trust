/**************************************
 * CONNECTION PATTERNS
 * Defines how players are connected in the tournament
 * Each pattern is a separate module for better modularity
 **************************************/

// Pattern type constants
var ConnectionPatternTypes = {
	ALL: "all",
	RING: "ring"
};

/**************************************
 * Base Connection Pattern Class
 **************************************/
function ConnectionPattern(patternType){
	var self = this;
	self.patternType = patternType || ConnectionPatternTypes.ALL;
	
	// Generate pairs of agents that should be connected
	// Override this in subclasses
	self.generatePairs = function(agents){
		throw new Error("generatePairs must be implemented by pattern subclass");
	};
	
	return self;
}

/**************************************
 * All-to-All Pattern (Round-Robin)
 * Connects every player to every other player
 **************************************/
function AllToAllPattern(){
	var self = new ConnectionPattern(ConnectionPatternTypes.ALL);
	
	self.generatePairs = function(agents){
		var pairs = [];
		// Full round-robin: connect all players to each other
		for(var i=0; i<agents.length; i++){
			for(var j=i+1; j<agents.length; j++){
				pairs.push([agents[i], agents[j]]);
			}
		}
		return pairs;
	};
	
	return self;
}

/**************************************
 * Ring Pattern (Neighbors Only)
 * Connects each player only to adjacent neighbors
 **************************************/
function RingPattern(){
	var self = new ConnectionPattern(ConnectionPatternTypes.RING);
	
	self.generatePairs = function(agents){
		var pairs = [];
		// Ring topology: connect only adjacent neighbors
		for(var i=0; i<agents.length; i++){
			var nextIndex = (i+1) % agents.length; // Wrap around to first player
			pairs.push([agents[i], agents[nextIndex]]);
		}
		return pairs;
	};
	
	return self;
}

/**************************************
 * Pattern Factory
 * Creates the appropriate pattern instance based on type
 **************************************/
function ConnectionPatternFactory(){
	var self = this;
	
	self.create = function(patternType){
		switch(patternType){
			case ConnectionPatternTypes.ALL:
				return new AllToAllPattern();
			case ConnectionPatternTypes.RING:
				return new RingPattern();
			default:
				console.warn("Unknown pattern type: " + patternType + ", defaulting to RING");
				return new RingPattern();
		}
	};
	
	return self;
}

// Export pattern types and factory
window.ConnectionPatternTypes = ConnectionPatternTypes;
window.ConnectionPatternFactory = new ConnectionPatternFactory();

