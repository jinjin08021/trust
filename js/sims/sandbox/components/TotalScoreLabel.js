/**************************************
 * Total Score Label Component
 * Displays the total sum of all players' payoffs
 **************************************/
function TotalScoreLabel(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM container
	self.dom = document.createElement("div");
	self.dom.style.cssText = "position: fixed; left: 20px; top: 20px; z-index: 1001;";
	
	// Total score label
	var scoreLabel = document.createElement("div");
	scoreLabel.id = "sandbox_total_score_label";
	scoreLabel.style.cssText = "font-family: 'FuturaHandwritten'; font-size: 18px; color: #333; margin-bottom: 10px;";
	scoreLabel.innerHTML = "Total score : 0";
	self.dom.appendChild(scoreLabel);
	
	// Speed multiplier button
	var speedMultiplier = 1;
	var speedButton = document.createElement("button");
	speedButton.style.cssText = "font-family: 'FuturaHandwritten'; font-size: 16px; color: #333; background: #fff; border: 2px solid #ccc; border-radius: 4px; padding: 5px 10px; cursor: pointer; transition: all 0.2s ease;";
	speedButton.innerHTML = ">> X1";
	speedButton.onmouseover = function(){
		speedButton.style.background = "#f0f0f0";
	};
	speedButton.onmouseout = function(){
		speedButton.style.background = "#fff";
	};
	speedButton.onclick = function(){
		speedMultiplier = (speedMultiplier % 4) + 1; // Cycle: 1 -> 2 -> 3 -> 4 -> 1
		speedButton.innerHTML = ">> X" + speedMultiplier;
		publish("tournament/speed", [speedMultiplier]);
	};
	self.dom.appendChild(speedButton);
	
	var updateTotalScore = function(){
		var total = 0;
		if(self.slideshow.objects.tournament && self.slideshow.objects.tournament.agents){
			for(var i=0; i<self.slideshow.objects.tournament.agents.length; i++){
				total += self.slideshow.objects.tournament.agents[i].coins || 0;
			}
		}
		var words = Words.get("sandbox_total_score");
		words = words.replace(/\[X\]/g, total+"");
		scoreLabel.innerHTML = words; // Update only the score label, not the entire container
	};
	
	// Update score after tournament completes
	listen(self, "tournament/step/completed", function(stage){
		if(stage === "play"){
			updateTotalScore();
		}
	});
	
	// Update score when tournament resets
	listen(self, "tournament/reset", function(){
		// Use setTimeout to ensure agents are reset first
		setTimeout(updateTotalScore, 10);
	});
	
	// Initialize score (with a small delay to ensure tournament is created)
	setTimeout(updateTotalScore, 100);
	
	// Cleanup
	self.remove = function(){
		unlisten(self);
	};
	
	return self;
}

