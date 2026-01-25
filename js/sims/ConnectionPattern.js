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
 * Extended Ring Pattern
 * Connects each player to N neighbors on each side
 * connections must be an even number
 **************************************/
function ExtendedRingPattern(connections){
	var self = new ConnectionPattern(ConnectionPatternTypes.RING);
	self.connections = connections || 2; // Default to 2 (1 on each side)
	
	// Ensure connections is even
	if(self.connections % 2 !== 0){
		console.warn("Connections must be even, rounding down to " + (self.connections - 1));
		self.connections = self.connections - 1;
	}
	
	self.generatePairs = function(agents){
		var pairs = [];
		var neighborsPerSide = self.connections / 2; // Number of neighbors on each side
		var agentCount = agents.length;
		
		// Use a set to track unique pairs (avoid duplicates)
		var pairSet = {};
		
		// For each agent, connect to neighbors on both sides
		for(var i=0; i<agentCount; i++){
			// Connect to neighbors on the right (forward)
			for(var offset=1; offset<=neighborsPerSide; offset++){
				var rightIndex = (i + offset) % agentCount;
				// Create unique key (smaller index first)
				var key = (i < rightIndex) ? i + "-" + rightIndex : rightIndex + "-" + i;
				if(!pairSet[key]){
					pairSet[key] = true;
					pairs.push([agents[i], agents[rightIndex]]);
				}
			}
			// Connect to neighbors on the left (backward)
			for(var offset=1; offset<=neighborsPerSide; offset++){
				var leftIndex = (i - offset + agentCount) % agentCount;
				// Create unique key (smaller index first)
				var key = (i < leftIndex) ? i + "-" + leftIndex : leftIndex + "-" + i;
				if(!pairSet[key]){
					pairSet[key] = true;
					pairs.push([agents[i], agents[leftIndex]]);
				}
			}
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
	
	self.create = function(patternType, connectionCount){
		connectionCount = connectionCount || 2; // Default to 2
		switch(patternType){
			case ConnectionPatternTypes.ALL:
				return new AllToAllPattern();
			case ConnectionPatternTypes.RING:
				// If connectionCount is 2, use simple RingPattern, otherwise use ExtendedRingPattern
				if(connectionCount === 2){
					return new RingPattern();
				} else {
					return new ExtendedRingPattern(connectionCount);
				}
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

