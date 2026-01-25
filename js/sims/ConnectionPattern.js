/**************************************
 * CONNECTION PATTERN
 * Defines how players are connected in the tournament
 * Ring pattern with configurable number of neighbors
 **************************************/

/**************************************
 * Ring Pattern (Configurable Neighbors)
 * Connects each player to N neighbors on each side
 * connections must be an even number
 * If connections = 2, connects to 1 neighbor on each side (simple ring)
 * If connections = 4, connects to 2 neighbors on each side, etc.
 * 
 * randomProbability: 0-100, probability that each agent will randomly connect to any other agent
 **************************************/
function ConnectionPattern(connections, randomProbability){
	var self = this;
	self.connections = connections !== undefined ? connections : 0; // Default to 0 (no connections)
	self.randomProbability = randomProbability !== undefined ? randomProbability : 0; // Default to 0%
	
	// Ensure connections is even (or 0)
	if(self.connections > 0 && self.connections % 2 !== 0){
		console.warn("Connections must be even, rounding down to " + (self.connections - 1));
		self.connections = self.connections - 1;
	}
	
	self.generatePairs = function(agents){
		var pairs = [];
		var agentCount = agents.length;
		
		// Use a set to track unique pairs (avoid duplicates)
		var pairSet = {};
		
		// For each agent, connect to neighbors on both sides (only if connections > 0)
		if(self.connections > 0){
			var neighborsPerSide = self.connections / 2; // Number of neighbors on each side
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
		}
		
		// Random connections: each agent has a probability of connecting to any other agent
		if(self.randomProbability > 0){
			for(var i=0; i<agentCount; i++){
				for(var j=0; j<agentCount; j++){
					if(i !== j){ // Don't connect to self
						// Check if this pair should have a random connection
						if(Math.random() * 100 < self.randomProbability){
							// Create unique key (smaller index first)
							var key = (i < j) ? i + "-" + j : j + "-" + i;
							if(!pairSet[key]){
								pairSet[key] = true;
								pairs.push([agents[i], agents[j]]);
							}
						}
					}
				}
			}
		}
		
		return pairs;
	};
	
	return self;
}

