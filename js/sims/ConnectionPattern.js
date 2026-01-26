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
 * strategyConnectionCounts: object mapping strategy names to their connection counts (how many neighbors)
 * strategyShuffleMode: object mapping strategy names to boolean (true = random connections, false = neighbor connections)
 **************************************/
function ConnectionPattern(connections, randomProbability, strategyConnectionCounts, strategyShuffleMode){
	var self = this;
	self.connections = connections !== undefined ? connections : 0; // Default to 0 (no connections) - used as fallback
	self.randomProbability = randomProbability !== undefined ? randomProbability : 0; // Default to 0%
	self.strategyConnectionCounts = strategyConnectionCounts || {}; // Strategy-specific connection counts
	self.strategyShuffleMode = strategyShuffleMode || {}; // Strategy-specific shuffle mode
	
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
		
		// For each agent, connect based on their strategy's connection count and shuffle mode
		for(var i=0; i<agentCount; i++){
			var agent = agents[i];
			var strategy = agent.strategyName || agent.strategy;
			
			// Get connection count for this strategy, or use default
			var connectionCount = self.strategyConnectionCounts[strategy] || self.connections || 0;
			
			// If connection count is 0, skip this agent (no connections regardless of shuffle mode)
			if(connectionCount === 0){
				continue;
			}
			
			// Ensure connection count is even (or 0)
			if(connectionCount % 2 !== 0){
				connectionCount = connectionCount - 1;
			}
			
			// If after rounding down it becomes 0, skip
			if(connectionCount === 0){
				continue;
			}
			
			var isShuffleMode = self.strategyShuffleMode[strategy] || false;
			
			if(isShuffleMode){
				// Random connections: randomly select N other agents to connect to
				var availableAgents = [];
				for(var j=0; j<agentCount; j++){
					if(j !== i){
						availableAgents.push(j);
					}
				}
				// Shuffle the available agents
				for(var k=availableAgents.length-1; k>0; k--){
					var randomIndex = Math.floor(Math.random() * (k+1));
					var temp = availableAgents[k];
					availableAgents[k] = availableAgents[randomIndex];
					availableAgents[randomIndex] = temp;
				}
				// Connect to the first N agents
				for(var n=0; n<connectionCount && n<availableAgents.length; n++){
					var targetIndex = availableAgents[n];
					// Create unique key (smaller index first)
					var key = (i < targetIndex) ? i + "-" + targetIndex : targetIndex + "-" + i;
					if(!pairSet[key]){
						pairSet[key] = true;
						pairs.push([agents[i], agents[targetIndex]]);
					}
				}
			} else {
				// Neighbor connections: connect to neighbors on each side
				var neighborsPerSide = connectionCount / 2; // Number of neighbors on each side
				
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

